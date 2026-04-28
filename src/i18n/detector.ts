import type { InitOptions } from 'i18next';

export const detectorOptions: InitOptions['detection'] = {
  order: ['path', 'cookie', 'navigator', 'htmlTag'],
  lookupFromPathIndex: 0,
  caches: ['cookie'],
};
