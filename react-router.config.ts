import type { Config } from '@react-router/dev/config';

export const LOCALES = [
  'en', 'zh-CN', 'zh-TW', 'es', 'hi', 'ar', 'bn', 'pt-BR', 'pt-PT', 'ru',
  'ja', 'de', 'fr', 'ko', 'it', 'tr', 'vi', 'pl', 'uk', 'nl',
  'id', 'th', 'fa', 'he', 'sv', 'cs', 'el', 'fil',
] as const;

export const RTL_LOCALES = ['ar', 'fa', 'he'] as const;

export const PAGES = ['', 'simulator', 'methodology', 'privacy', 'offline'];

export default {
  ssr: false,
  buildDirectory: 'dist',
  prerender: () =>
    LOCALES.flatMap((lang) =>
      PAGES.map((p) => (p ? `/${lang}/${p}` : `/${lang}`)),
    ),
} satisfies Config;
