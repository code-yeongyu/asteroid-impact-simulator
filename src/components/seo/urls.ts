import { LOCALES, type Locale } from '@/i18n/types';

export const BASE_URL = 'https://asteroid-impact-simulator.pages.dev';
export const OG_IMAGE_URL = `${BASE_URL}/og-image.png`;

export const PAGES = ['', 'simulator', 'methodology', 'privacy', 'pwa'] as const;
export type Page = (typeof PAGES)[number];

export function canonicalUrl(locale: Locale, page: Page): string {
  const path = page === '' ? '' : `/${page}`;
  return `${BASE_URL}/${locale}${path}`;
}

export function allHreflangUrls(page: Page): Array<{ locale: Locale; url: string }> {
  return LOCALES.map((locale) => ({
    locale,
    url: canonicalUrl(locale, page),
  }));
}
