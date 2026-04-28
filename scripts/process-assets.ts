#!/usr/bin/env node
/**
 * Process raw cosmic assets (Stage 2 of two-stage pipeline).
 *
 * Reads PNGs from scripts/.imagegen-cache/, applies:
 *   1. Optional chroma-key removal (per-asset config) for green-screen alpha
 *   2. Lanczos3 resampling to each declared output size (1x, 2x, ...)
 *   3. Triple-format export: AVIF (q75) + WebP (q92) + PNG fallback
 *   4. Metadata stamp: includes asset slug + source ('imagegen' | 'placeholder')
 *
 * Output layout:
 *   public/assets/{slug}@1x.{avif,webp,png}
 *   public/assets/{slug}@2x.{avif,webp,png}   (if asset declares scale: 2)
 *   public/assets/{slug}.json                 (sidecar with provenance)
 *
 * Run-mode:
 *   `node scripts/process-assets.mjs` (after generate-assets.mjs)
 *   `bun run generate:assets`         (runs both stages back-to-back)
 */

import { mkdir, readFile, writeFile, stat, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { stripChromaKey } from './lib/chroma-key.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MANIFEST_PATH = join(__dirname, 'asset-prompts.json');
const CACHE_DIR = join(__dirname, '.imagegen-cache');
const CACHE_MANIFEST = join(CACHE_DIR, '.manifest.json');
const PUBLIC_DIR = join(ROOT, 'public', 'assets');

const log = (...args) => console.log('[process-assets]', ...args);

function suffixForScale(scale) {
  return scale === 1 ? '@1x' : `@${scale}x`;
}

async function processAsset(asset, cacheManifest) {
  const slug = asset.slug;
  const inputPath = join(CACHE_DIR, `${slug}.png`);
  if (!existsSync(inputPath)) {
    throw new Error(
      `${slug}: missing cached input at ${inputPath}. Run generate-assets.mjs first.`,
    );
  }
  const cacheEntry = cacheManifest[slug] ?? { source: 'unknown' };

  // Build base pipeline with optional chroma-key. We keep the post-key buffer
  // in memory once and fork it for each output scale - avoids redundant work.
  let basePipeline = sharp(inputPath);
  if (asset.chromaKey && cacheEntry.source === 'imagegen') {
    log(
      `${slug}: applying chroma-key (rgb=${asset.chromaKey.rgb.join(',')}, tol=${asset.chromaKey.tolerance})`,
    );
    basePipeline = await stripChromaKey(basePipeline, asset.chromaKey);
  } else if (asset.chromaKey) {
    log(`${slug}: chroma-key skipped (source=${cacheEntry.source}, alpha already correct)`);
  }
  const baseBuffer = await basePipeline.png().toBuffer();
  const outputs = asset.outputs ?? [{ scale: 1, width: 0, height: 0 }];

  for (const out of outputs) {
    const stem = `${slug}${suffixForScale(out.scale)}`;
    const resized = sharp(baseBuffer).resize(out.width, out.height, {
      kernel: 'lanczos3',
      fit: 'inside',
      withoutEnlargement: false,
    });

    const avifPath = join(PUBLIC_DIR, `${stem}.avif`);
    const webpPath = join(PUBLIC_DIR, `${stem}.webp`);

    // PNG fallback policy:
    //   - emit only at @1x (browsers without AVIF/WebP are vanishingly rare on
    //     2026 mobile/desktop targets; @1x PNG is the safety net for deep-legacy)
    //   - opaque hero backgrounds (cosmic-void-bg) use palette PNG (8-bit indexed)
    //     to keep size sane without sacrificing visual fidelity at 1x
    const tasks = [
      resized.clone().avif({ quality: 75, effort: 6 }).toFile(avifPath),
      resized.clone().webp({ quality: 92, effort: 6, alphaQuality: 100 }).toFile(webpPath),
    ];
    let pngPath = null;
    if (out.scale === 1) {
      pngPath = join(PUBLIC_DIR, `${stem}.png`);
      const pngPipeline = resized.clone().png({
        compressionLevel: 9,
        palette: !asset.alphaChannel, // indexed PNG for opaque hero
      });
      tasks.push(pngPipeline.toFile(pngPath));
    }
    await Promise.all(tasks);

    const emitted = pngPath ? [avifPath, webpPath, pngPath] : [avifPath, webpPath];
    for (const p of emitted) {
      const s = await stat(p);
      log(`  ${stem}.${p.split('.').pop()}: ${(s.size / 1024).toFixed(1)} KB`);
    }
  }

  // Sidecar provenance JSON.
  const sidecar = {
    slug,
    source: cacheEntry.source,
    specHash: cacheEntry.specHash,
    generatedAt: cacheEntry.generatedAt,
    model: asset.model,
    outputs: outputs.map((o) => ({ scale: o.scale, width: o.width, height: o.height })),
    pipelineVersion: 1,
  };
  await writeFile(
    join(PUBLIC_DIR, `${slug}.json`),
    JSON.stringify(sidecar, null, 2) + '\n',
    'utf8',
  );
}

async function pruneOrphans(manifest) {
  const slugs = new Set(manifest.assets.map((a) => a.slug));
  if (!existsSync(PUBLIC_DIR)) return;
  const files = await readdir(PUBLIC_DIR);
  for (const f of files) {
    const slug = f.replace(/(@\d+x)?\.(avif|webp|png|json)$/, '');
    if (!slugs.has(slug)) {
      await unlink(join(PUBLIC_DIR, f));
      log(`pruned orphan: ${f}`);
    }
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'));
  const cacheManifest = existsSync(CACHE_MANIFEST)
    ? JSON.parse(await readFile(CACHE_MANIFEST, 'utf8'))
    : {};

  await mkdir(PUBLIC_DIR, { recursive: true });
  for (const asset of manifest.assets) {
    log(`\n[asset] ${asset.slug}`);
    await processAsset(asset, cacheManifest);
  }
  await pruneOrphans(manifest);
  log('\n[ok] all assets processed');
}

main().catch((err) => {
  console.error('[process-assets] FATAL', err);
  process.exit(1);
});
