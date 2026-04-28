declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: {
    onOfflineReady?: () => void;
    onNeedRefresh?: () => void;
  }): {
    offlineReady: readonly [boolean, (value: boolean) => void];
    needRefresh: readonly [boolean, (value: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
