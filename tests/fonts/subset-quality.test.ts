import { describe, it, expect } from 'vitest';
import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');
const FONTS_DIR = join(ROOT, 'public/fonts');
const CSS_PATH = join(ROOT, 'src/styles/fonts.css');

const BUDGETS: Record<string, number> = {
  'inter-latin-400-normal.woff2': 26_000,
  'inter-latin-500-normal.woff2': 26_000,
  'inter-latin-700-normal.woff2': 26_000,
  'space-grotesk-latin-500-normal.woff2': 26_000,
  'space-grotesk-latin-700-normal.woff2': 26_000,
  'jetbrains-mono-latin-400-normal.woff2': 26_000,
};

describe('font subsetting', () => {
  it('produces woff2 files in public/fonts', async () => {
    const files = await readdir(FONTS_DIR);
    const woff2Files = files.filter((f) => f.endsWith('.woff2'));
    expect(woff2Files.length).toBeGreaterThan(0);
  });

  it('latin critical fonts stay within 26 KB budget', async () => {
    for (const [name, budget] of Object.entries(BUDGETS)) {
      const path = join(FONTS_DIR, name);
      const s = await stat(path);
      expect(s.size, `${name} exceeds ${budget} bytes`).toBeLessThanOrEqual(budget);
    }
  });

  it('total font directory is under 800 KB', async () => {
    const files = await readdir(FONTS_DIR);
    let total = 0;
    for (const f of files) {
      const s = await stat(join(FONTS_DIR, f));
      total += s.size;
    }
    expect(total).toBeLessThanOrEqual(800 * 1024);
  });

  it('fonts.css exists and declares @font-face blocks', async () => {
    const css = await readFile(CSS_PATH, 'utf-8');
    expect(css).toContain('@font-face');
    expect(css).toContain('unicode-range');
    expect(css).toContain("font-display: swap");
  });

  it('fonts.css references existing font files', async () => {
    const css = await readFile(CSS_PATH, 'utf-8');
    const matches = css.matchAll(/url\(['"]?\/fonts\/([^'"]+)['"]?\)/g);
    for (const match of matches) {
      const filename = match[1];
      const path = join(FONTS_DIR, filename);
      const s = await stat(path);
      expect(s.isFile()).toBe(true);
    }
  });
});
