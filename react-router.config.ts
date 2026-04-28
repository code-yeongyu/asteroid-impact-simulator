import type { Config } from '@react-router/dev/config';

export const LOCALES = [
  'en', 'zh-CN', 'zh-TW', 'es', 'hi', 'ar', 'bn', 'pt-BR', 'pt-PT', 'ru',
  'ja', 'de', 'fr', 'ko', 'it', 'tr', 'vi', 'pl', 'uk', 'nl',
  'id', 'th', 'fa', 'he', 'sv', 'cs', 'el', 'fil',
] as const;

export const RTL_LOCALES = ['ar', 'fa', 'he'] as const;

export const PRERENDER_PAGES = [
  '',
  'simulator',
  'methodology',
  'privacy',
  'this-does-not-exist-404-test',
] as const;

export const PRERENDER_PATHS = LOCALES.flatMap((lang) =>
  PRERENDER_PAGES.map((page) => (page ? `/${lang}/${page}` : `/${lang}`)),
);

export default {
  ssr: false,
  buildDirectory: 'dist',
  prerender: PRERENDER_PATHS,
} satisfies Config;
