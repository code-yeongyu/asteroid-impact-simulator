export const LOCALES = [
  'en',
  'zh-CN',
  'zh-TW',
  'es',
  'hi',
  'ar',
  'bn',
  'pt-BR',
  'pt-PT',
  'ru',
  'ja',
  'de',
  'fr',
  'ko',
  'it',
  'tr',
  'vi',
  'pl',
  'uk',
  'nl',
  'id',
  'th',
  'fa',
  'he',
  'sv',
  'cs',
  'el',
  'fil',
] as const;

export type Locale = (typeof LOCALES)[number];

export const RTL_LOCALES = ['ar', 'fa', 'he'] as const;
export type RtlLocale = (typeof RTL_LOCALES)[number];

export const FALLBACK_LOCALE = 'en' as const;

export const NAMESPACES = [
  'common',
  'simulator',
  'methodology',
  'landing',
  'pwa',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

export function isRtlLocale(locale: string): locale is RtlLocale {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}

export function isValidLocale(locale: string): locale is Locale {
  return (LOCALES as readonly string[]).includes(locale);
}
