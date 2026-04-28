#!/usr/bin/env bun
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES } from '../src/i18n/types';
import { PAGES, canonicalUrl } from '../src/components/seo/urls';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSitemap(): string {
  const urls: string[] = [];

  for (const locale of LOCALES) {
    for (const page of PAGES) {
      const loc = canonicalUrl(locale, page);
      const alternates = LOCALES.map(
        (lng) =>
          `    <xhtml:link rel="alternate" hreflang="${lng}" href="${escapeXml(canonicalUrl(lng, page))}" />`,
      ).join('\n');
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(canonicalUrl('en', page))}" />`;

      urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
${alternates}
${xDefault}
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
}

function main(): void {
  const sitemap = buildSitemap();
  const outPath = join(process.cwd(), 'dist', 'sitemap.xml');
  writeFileSync(outPath, sitemap, 'utf-8');
  console.log(`Sitemap written to ${outPath} (${LOCALES.length * PAGES.length} URLs)`);
}

main();
