#!/usr/bin/env bun
import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';

const LOCALES_DIR = join(process.cwd(), 'public', 'locales');
const SRC_DIR = join(process.cwd(), 'src');

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys.push(...getAllKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function* walkTsFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkTsFiles(path);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      yield path;
    }
  }
}

function extractNamespaceKeys(srcDir: string): Map<string, Set<string>> {
  const namespaceKeys = new Map<string, Set<string>>();
  const tCallRegex = /t\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const file of walkTsFiles(srcDir)) {
    const content = readFileSync(file, 'utf-8');
    let match: RegExpExecArray | null;
    while ((match = tCallRegex.exec(content)) !== null) {
      const key = match[1];
      if (!key.includes(':')) continue;
      const [ns, ...rest] = key.split(':');
      const path = rest.join(':');
      if (!namespaceKeys.has(ns)) {
        namespaceKeys.set(ns, new Set());
      }
      namespaceKeys.get(ns)!.add(path);
    }
  }

  return namespaceKeys;
}

function main(): number {
  if (!existsSync(LOCALES_DIR)) {
    console.error('Error: public/locales directory not found');
    return 1;
  }

  const locales = readdirSync(LOCALES_DIR).filter((d) => {
    const s = statSync(join(LOCALES_DIR, d));
    return s.isDirectory();
  });

  const srcKeys = extractNamespaceKeys(SRC_DIR);
  let hasErrors = false;

  for (const locale of locales) {
    const localeDir = join(LOCALES_DIR, locale);
    const files = readdirSync(localeDir).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const ns = file.replace('.json', '');
      const jsonPath = join(localeDir, file);
      const json = JSON.parse(readFileSync(jsonPath, 'utf-8')) as Record<string, unknown>;
      const jsonKeys = new Set(getAllKeys(json));
      const usedKeys = srcKeys.get(ns) ?? new Set<string>();

      if (usedKeys.size === 0) {
        continue;
      }

      const missing = [...usedKeys].filter((k) => !jsonKeys.has(k));
      const coverage =
        usedKeys.size > 0
          ? Math.round(((usedKeys.size - missing.length) / usedKeys.size) * 100)
          : 100;

      if (missing.length > 0) {
        console.error(
          `[${locale}/${ns}] Missing keys (${coverage}% coverage):`,
        );
        for (const k of missing) {
          console.error(`  - ${k}`);
        }
        hasErrors = true;
      } else {
        console.log(`[${locale}/${ns}] 100% coverage (${usedKeys.size} keys)`);
      }
    }
  }

  if (hasErrors) {
    console.error('\nCoverage check failed: some locales are incomplete.');
    return 1;
  }

  console.log('\nAll locales have 100% key coverage.');
  return 0;
}

process.exit(main());
