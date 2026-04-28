#!/usr/bin/env bun
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES, PRERENDER_PAGES } from '../react-router.config';

const DIST_ROOT = existsSync(join(process.cwd(), 'dist', 'client'))
  ? join(process.cwd(), 'dist', 'client')
  : join(process.cwd(), 'dist');

const expectedFiles = LOCALES.flatMap((locale) =>
  PRERENDER_PAGES.map((page) =>
    page === ''
      ? join(DIST_ROOT, locale, 'index.html')
      : join(DIST_ROOT, locale, page, 'index.html'),
  ),
);

const missingFiles = expectedFiles.filter((file) => !existsSync(file));

if (missingFiles.length > 0) {
  console.error('Missing prerendered HTML files:');
  for (const file of missingFiles) console.error(`- ${file}`);
  process.exit(1);
}

function countFiles(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const path = join(dir, entry.name);
    return total + (entry.isDirectory() ? countFiles(path) : 1);
  }, 0);
}

const fileCount = countFiles(DIST_ROOT);
if (fileCount >= 5_000) {
  console.error(`Prerender output has ${fileCount} files, expected fewer than 5000.`);
  process.exit(1);
}

console.log(
  `verify-prerender: found ${expectedFiles.length} prerendered HTML files under ${DIST_ROOT} (${fileCount} total files)`,
);
