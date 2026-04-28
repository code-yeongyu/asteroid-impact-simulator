import type { StateCreator } from 'zustand';
import type { AppStoreBase, UISlice } from '../lib/store/types';

type StoreSlice<TSlice> = StateCreator<AppStoreBase, [], [], TSlice>;

export const DEFAULT_LAYERS: UISlice['layers'] = {
  fireball: true,
  thermal: true,
  overpressure: true,
  ejecta: true,
};

export const createUISlice: StoreSlice<UISlice> = (set) => ({
  isResultsPanelOpen: true,
  isMethodologyPanelOpen: false,
  activeLocale: 'en',
  direction: 'ltr',
  shareUrlHash: '',
  layers: DEFAULT_LAYERS,
  setResultsPanelOpen: (isResultsPanelOpen) => {
    set({ isResultsPanelOpen });
  },
  setMethodologyPanelOpen: (isMethodologyPanelOpen) => {
    set({ isMethodologyPanelOpen });
  },
  setLayerVisible: (layer, isVisible) => {
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: isVisible,
      },
    }));
  },
  setLocaleDirection: (activeLocale, direction) => {
    set({ activeLocale, direction });
  },
  setShareUrlHash: (shareUrlHash) => {
    set({ shareUrlHash });
  },
});
