import type { InitOptions } from 'i18next';

export const detectorOptions: InitOptions['detection'] = {
  order: ['path', 'localStorage', 'navigator', 'htmlTag'],
  lookupFromPathIndex: 0,
  caches: ['localStorage'],
};
