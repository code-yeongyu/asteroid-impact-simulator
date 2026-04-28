import { useRegisterSW as useViteRegisterSW } from 'virtual:pwa-register/react';

export function useRegisterSW(): ReturnType<typeof useViteRegisterSW> {
  return useViteRegisterSW({
    onOfflineReady() {
      console.info('PWA offline ready');
    },
    onNeedRefresh() {
      console.info('PWA update ready');
    },
  });
}
