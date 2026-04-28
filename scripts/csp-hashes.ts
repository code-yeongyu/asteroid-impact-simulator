import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BUILD_DIRECTORIES = ['dist/client', 'dist'];
const CSP_HASH_TOKEN = '__CSP_SCRIPT_HASHES__';
const INLINE_SCRIPT_PATTERN = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;

async function listFiles(directory: string, suffix: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return listFiles(path, suffix);
      }

      return entry.isFile() && entry.name.endsWith(suffix) ? [path] : [];
    }),
  );

  return nestedFiles.flat();
}

function hashInlineScripts(html: string): string[] {
  const hashes = new Set<string>();
  for (const match of html.matchAll(INLINE_SCRIPT_PATTERN)) {
    const scriptBody = match[1] ?? '';
    if (scriptBody.trim().length === 0) {
      continue;
    }

    const digest = createHash('sha256').update(scriptBody).digest('base64');
    hashes.add(`'sha256-${digest}'`);
  }

  return [...hashes].sort();
}

function normalizeScriptSrcSpacing(csp: string): string {
  return csp.replace(/script-src\s+([^;]+);/, (_directive, sources: string) => {
    const normalizedSources = sources.trim().replace(/\s+/g, ' ');
    return `script-src ${normalizedSources};`;
  });
}

async function collectHashes(buildDirectory: string): Promise<string[]> {
  const htmlFiles = await listFiles(buildDirectory, '.html');
  const hashes = new Set<string>();

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, 'utf8');
    for (const hash of hashInlineScripts(html)) {
      hashes.add(hash);
    }
  }

  return [...hashes].sort();
}

async function patchHeaders(buildDirectory: string, hashes: string[]): Promise<void> {
  const headerPath = join(buildDirectory, '_headers');
  if (!existsSync(headerPath)) {
    return;
  }

  const replacement = hashes.join(' ');
  const headers = await readFile(headerPath, 'utf8');
  const patchedHeaders = normalizeScriptSrcSpacing(headers.replace(CSP_HASH_TOKEN, replacement));
  await writeFile(headerPath, patchedHeaders);
}

async function main(): Promise<void> {
  const buildDirectory = BUILD_DIRECTORIES.find((directory) => existsSync(directory));
  if (buildDirectory === undefined) {
    throw new Error('No build output found. Run vite build before csp-hashes.');
  }

  const hashes = await collectHashes(buildDirectory);
  await patchHeaders(buildDirectory, hashes);
  console.info(`csp-hashes: wrote ${hashes.length} inline script hash(es) to ${buildDirectory}/_headers`);
}

await main();
