import type { InitOptions } from 'i18next';

export const backendOptions: InitOptions['backend'] = {
  loadPath: '/locales/{{lng}}/{{ns}}.json',
};
