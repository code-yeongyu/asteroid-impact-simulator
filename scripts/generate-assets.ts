#!/usr/bin/env node
/**
 * Generate cosmic raster assets (Stage 1 of two-stage pipeline).
 *
 * Stage 1 (this file):  raw image production
 *   - Reads scripts/asset-prompts.json (manifest)
 *   - For each asset, fires `~/.agents/skills/imagegen/scripts/bg_run.sh` in
 *     background (real GPT Image 2 / Nano Banana when API keys are present)
 *   - Polls all sentinels in parallel; each job has a per-asset timeout
 *   - On any failure (no API key, network error, timeout), falls back to
 *     procedural cosmic placeholders rendered via scripts/lib/placeholder-renderer.mjs
 *     (see TODO_REGENERATE marker in `docs/IMAGES.md`)
 *   - Writes raw PNG output to scripts/.imagegen-cache/{slug}.png
 *
 * Stage 2 lives in scripts/process-assets.mjs (sharp post-processing).
 *
 * Usage:
 *   bun run generate:assets         # full pipeline (gen + process)
 *   node scripts/generate-assets.mjs # stage 1 only
 *
 * Env vars consumed:
 *   GEMINI_API_KEY / GOOGLE_API_KEY -> enables nano-banana-pro live generation
 *   OPENAI_API_KEY                  -> enables gpt-image-2 live generation
 *   IMAGEGEN_TIMEOUT_MS             -> per-asset wait budget (default 120000)
 *   IMAGEGEN_FORCE_PLACEHOLDERS=1   -> skip imagegen entirely (CI cheap path)
 *
 * Idempotency: scripts/.imagegen-cache/.manifest.json records the SHA-256 of
 * (prompt + model + size + version) per slug. If unchanged AND output exists,
 * we skip regeneration. Pass --force to override.
 */

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';

import { renderPlaceholder } from './lib/placeholder-renderer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MANIFEST_PATH = join(__dirname, 'asset-prompts.json');
const CACHE_DIR = join(__dirname, '.imagegen-cache');
const CACHE_MANIFEST = join(CACHE_DIR, '.manifest.json');
const BG_RUN_SCRIPT = join(homedir(), '.agents/skills/imagegen/scripts/bg_run.sh');

const TIMEOUT_MS = Number(process.env.IMAGEGEN_TIMEOUT_MS ?? 120000);
const FORCE_PLACEHOLDERS = process.env.IMAGEGEN_FORCE_PLACEHOLDERS === '1';
const FORCE_REGEN = process.argv.includes('--force');

const log = (...args) => console.log('[generate-assets]', ...args);
const warn = (...args) => console.warn('[generate-assets]', ...args);

function hashSpec(asset) {
  const h = createHash('sha256');
  h.update(
    JSON.stringify({
      slug: asset.slug,
      model: asset.model,
      size: asset.size,
      prompt: asset.prompt,
      negative: asset.negative_prompt ?? '',
      alpha: asset.alphaChannel,
      chroma: asset.chromaKey,
      pipelineVersion: 1,
    }),
  );
  return h.digest('hex').slice(0, 16);
}

async function readCacheManifest() {
  if (!existsSync(CACHE_MANIFEST)) return {};
  try {
    return JSON.parse(await readFile(CACHE_MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

async function writeCacheManifest(manifest) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

function hasImagegenCredentials(model) {
  if (model.startsWith('nano-banana')) {
    return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  }
  if (model.startsWith('gpt-image')) {
    return Boolean(process.env.OPENAI_API_KEY);
  }
  return false;
}

/**
 * Fire imagegen bg_run.sh for one asset and wait for sentinel files.
 * Returns true on .done, false on .failed / timeout.
 */
function runImagegen(asset, outputPath) {
  return new Promise((resolveJob) => {
    const args = ['--', '--model', asset.model, '--prompt', asset.prompt, '--filename', outputPath];
    if (asset.size && !asset.model.startsWith('nano-banana')) {
      args.push('--size', asset.size);
    }
    if (asset.negative_prompt && asset.model.startsWith('gpt-image')) {
      // gpt-image-2 supports negative-prompt indirectly via prompt style;
      // imagegen CLI passes it through as a hint.
      args.push('--negative-prompt', asset.negative_prompt);
    }

    log(`firing imagegen for ${asset.slug} (${asset.model})...`);
    const child = spawn(BG_RUN_SCRIPT, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      if (code !== 0) {
        warn(`bg_run.sh exited ${code} for ${asset.slug}: ${stderr.trim()}`);
        resolveJob(false);
        return;
      }
      // Parse handles printed by bg_run.sh.
      const sentinel = stdout.match(/^SENTINEL=(.+)$/m)?.[1];
      const errorSentinel = stdout.match(/^ERROR_SENTINEL=(.+)$/m)?.[1];
      const logPath = stdout.match(/^LOG=(.+)$/m)?.[1];
      if (!sentinel || !errorSentinel) {
        warn(`bg_run.sh stdout malformed for ${asset.slug}: ${stdout}`);
        resolveJob(false);
        return;
      }
      // Poll sentinels.
      const start = Date.now();
      const interval = setInterval(async () => {
        if (existsSync(sentinel)) {
          clearInterval(interval);
          log(`[ok] ${asset.slug}: imagegen done`);
          resolveJob(true);
        } else if (existsSync(errorSentinel)) {
          clearInterval(interval);
          let logTail = '';
          try {
            logTail = (await readFile(logPath, 'utf8')).split('\n').slice(-10).join('\n');
          } catch {
            /* ignore */
          }
          warn(`[fail] ${asset.slug}: imagegen failed\n${logTail}`);
          resolveJob(false);
        } else if (Date.now() - start > TIMEOUT_MS) {
          clearInterval(interval);
          warn(`[timeout] ${asset.slug}: imagegen timeout after ${TIMEOUT_MS}ms`);
          resolveJob(false);
        }
      }, 1000);
    });
  });
}

/**
 * Render a procedural placeholder PNG matching the manifest dimensions.
 * Output is the imagegen "raw" size (largest output target), so process-assets
 * can downsample via Lanczos3 to lower DPRs.
 */
async function renderPlaceholderForAsset(asset, outputPath) {
  log(`rendering procedural placeholder for ${asset.slug}...`);
  const [w, h] = asset.size.split('x').map(Number);
  const pipeline = renderPlaceholder(asset.slug, { width: w, height: h });
  await pipeline
    .png({ compressionLevel: 9 })
    .withMetadata({ exif: { IFD0: { Software: 'dionysus-placeholder@v1 TODO_REGENERATE' } } })
    .toFile(outputPath);
  log(`[ok] ${asset.slug}: placeholder written (${w}x${h})`);
}

async function generateOne(asset, cacheManifest) {
  const slug = asset.slug;
  const outputPath = join(CACHE_DIR, `${slug}.png`);
  const sourceTagPath = join(CACHE_DIR, `${slug}.source`);
  const specHash = hashSpec(asset);
  const cached = cacheManifest[slug];
  const upToDate = cached && cached.specHash === specHash && existsSync(outputPath) && !FORCE_REGEN;

  if (upToDate) {
    log(`[cache] ${slug}: cache hit (specHash=${specHash}, source=${cached.source}) - skipping`);
    return { slug, source: cached.source, path: outputPath };
  }

  await mkdir(CACHE_DIR, { recursive: true });

  let source;
  if (FORCE_PLACEHOLDERS || !hasImagegenCredentials(asset.model)) {
    if (!FORCE_PLACEHOLDERS) {
      warn(`${slug}: no API key for ${asset.model}, falling back to placeholder`);
    }
    await renderPlaceholderForAsset(asset, outputPath);
    source = 'placeholder';
  } else {
    const ok = await runImagegen(asset, outputPath);
    if (ok) {
      source = 'imagegen';
    } else {
      warn(`${slug}: imagegen failed, falling back to placeholder`);
      await renderPlaceholderForAsset(asset, outputPath);
      source = 'placeholder-fallback';
    }
  }

  await writeFile(sourceTagPath, source + '\n', 'utf8');
  cacheManifest[slug] = { specHash, source, generatedAt: new Date().toISOString() };
  return { slug, source, path: outputPath };
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const cacheManifest = await readCacheManifest();
  const results = [];
  // Run jobs concurrently for imagegen (the bg_run.sh is already async and
  // polling per asset is independent). For placeholders, sharp's async raw
  // pipeline is also independent - batch them all.
  const settled = await Promise.all(manifest.assets.map((a) => generateOne(a, cacheManifest)));
  results.push(...settled);
  await writeCacheManifest(cacheManifest);

  const allPlaceholder = results.every((r) => r.source.startsWith('placeholder'));
  log(`\nSummary:`);
  for (const r of results) {
    const stats = await stat(r.path);
    log(`  ${r.slug}: ${r.source} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
  if (allPlaceholder) {
    log(
      `\nNOTE: All assets generated as procedural placeholders. To regenerate ` +
        `via real imagegen, set GEMINI_API_KEY (nano-banana-pro) or OPENAI_API_KEY ` +
        `(gpt-image-2) and re-run \`bun run generate:assets --force\`. See docs/IMAGES.md.`,
    );
  }
  return results;
}

main().catch((err) => {
  console.error('[generate-assets] FATAL', err);
  process.exit(1);
});
