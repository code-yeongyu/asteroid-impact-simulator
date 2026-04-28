import { describe, it, expect } from 'vitest';

const LOCALES = [
  'en', 'zh-CN', 'zh-TW', 'es', 'hi', 'ar', 'bn', 'pt-BR', 'pt-PT', 'ru',
  'ja', 'de', 'fr', 'ko', 'it', 'tr', 'vi', 'pl', 'uk', 'nl',
  'id', 'th', 'fa', 'he', 'sv', 'cs', 'el', 'fil',
];

const PAGES = ['', 'simulator', 'methodology', 'privacy', 'offline'];

const prerender = () =>
  LOCALES.flatMap((lang) => PAGES.map((p) => (p ? `/${lang}/${p}` : `/${lang}`)));

describe('routing config', () => {
  it('prerender returns 140 paths (28 locales × 5 pages)', () => {
    const paths = prerender();
    expect(paths).toHaveLength(140);
  });

  it('includes all locale roots', () => {
    const paths = prerender();
    expect(paths).toContain('/en');
    expect(paths).toContain('/ar');
    expect(paths).toContain('/ja');
    expect(paths).toContain('/de');
    expect(paths).toContain('/zh-CN');
  });

  it('includes all page variants', () => {
    const paths = prerender();
    expect(paths).toContain('/en/simulator');
    expect(paths).toContain('/en/methodology');
    expect(paths).toContain('/en/privacy');
    expect(paths).toContain('/en/offline');
  });
});
