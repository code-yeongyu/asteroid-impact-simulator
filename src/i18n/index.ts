import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as ICUmod from 'i18next-icu';
import LanguageDetector from 'i18next-browser-languagedetector';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { LOCALES, FALLBACK_LOCALE, type Locale } from './types';

const ICU = ICUmod.default;

const enModules = import.meta.glob('/public/locales/en/*.json', {
  eager: true,
});

const enResources: Record<string, Record<string, unknown>> = {};
for (const [path, mod] of Object.entries(enModules)) {
  const match = path.match(/\/public\/locales\/en\/(.+)\.json$/);
  if (match != null && match[1] != null && match[1] !== '') {
    enResources[match[1]] = (mod as { default: Record<string, unknown> }).default;
  }
}

const bundledBackend = resourcesToBackend((lng: string, ns: string) => {
  if (lng === 'en' && enResources[ns]) {
    return enResources[ns];
  }
  throw new Error(`Bundled resource not found: ${lng}/${ns}`);
});

void i18next
  .use(ICU)
  .use(LanguageDetector)
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...LOCALES],
    partialBundledLanguages: true,
    ns: ['common', 'simulator', 'methodology', 'landing', 'pwa'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'cookie', 'navigator', 'htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['cookie'],
    },
    backend: {
      backends: [bundledBackend, HttpBackend],
      backendOptions: [
        {},
        {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
      ],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;

export function changeLanguage(lng: Locale): Promise<unknown> {
  return i18next.changeLanguage(lng);
}
