import { create } from 'zustand';
import { createComputed } from 'zustand-computed';
import { createJSONStorage, devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { StateStorage } from 'zustand/middleware';
import type { AppStoreBase, ComputedSimSlice, PersistedImpactState } from '../lib/store/types';
import { replaceUrlFromParams } from '../lib/url';
import type { AsteroidParams } from '../types';
import { computeDomainImpactResult, computeKineticEnergy, computeMass, DEFAULT_IMPACT_PARAMS } from './paramsSlice';
import { cancelPendingImpactResult } from './paramsSlice';
import { createParamsSlice } from './paramsSlice';
import { createScenariosSlice, HISTORICAL_EVENTS } from './scenariosSlice';
import { createUISlice, DEFAULT_LAYERS } from './uiSlice';

export const IMPACT_STORE_STORAGE_KEY = 'impactStore-params';

const memoryStorage = new Map<string, string>();

interface SynchronousStateStorage extends StateStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

const fallbackStorage: SynchronousStateStorage = {
  getItem: (name) => memoryStorage.get(name) ?? null,
  setItem: (name, value) => {
    memoryStorage.set(name, value);
  },
  removeItem: (name) => {
    memoryStorage.delete(name);
  },
};

function isUsableStorage(storage: Storage | undefined): boolean {
  return (
    storage !== undefined &&
    typeof storage.getItem === 'function' &&
    typeof storage.setItem === 'function' &&
    typeof storage.removeItem === 'function'
  );
}

function getImpactStoreStorage(): SynchronousStateStorage {
  if (typeof window === 'undefined' || !isUsableStorage(window.localStorage)) {
    return fallbackStorage;
  }

  return {
    getItem: (name) => window.localStorage.getItem(name),
    setItem: (name, value) => {
      window.localStorage.setItem(name, value);
    },
    removeItem: (name) => {
      window.localStorage.removeItem(name);
    },
  };
}

const computed = createComputed<AppStoreBase, ComputedSimSlice>(
  (state) => ({
    mass: computeMass(state.params),
    kineticEnergy: computeKineticEnergy(state.params),
  }),
  {
    shouldRecompute: (state, nextState) => {
      const nextParams = nextState.params ?? state.params;
      return state.params !== nextParams;
    },
  },
);

const createBaseStore: StateCreator<AppStoreBase, [], [], AppStoreBase> = (...args) => ({
  ...createParamsSlice(...args),
  ...createScenariosSlice(...args),
  ...createUISlice(...args),
});

export const useImpactStore = create<AppStoreBase>()(
  subscribeWithSelector(
    computed(
      devtools(
        persist(createBaseStore, {
          name: IMPACT_STORE_STORAGE_KEY,
          storage: createJSONStorage<PersistedImpactState>(getImpactStoreStorage),
          partialize: (state): PersistedImpactState => ({
            params: state.params,
            scenarios: state.scenarios,
            selectedScenarioId: state.selectedScenarioId,
          }),
          onRehydrateStorage: () => (state) => {
            if (state !== undefined) {
              state.computeResultNow();
            }
          },
        }),
        {
          name: 'ImpactStore',
          enabled: import.meta.env.DEV,
        },
      ),
    ),
  ),
);

export function hydrateImpactStoreFromLocation(search?: string): void {
  const source = search ?? (typeof window === 'undefined' ? '' : window.location.search);
  useImpactStore.getState().hydrateFromUrlSearch(source);
  useImpactStore.getState().computeResultNow();
}

export function startImpactStoreUrlSync(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const syncParamsToUrl = (params: AsteroidParams): void => {
    const shareUrlHash = replaceUrlFromParams(params);
    if (shareUrlHash !== null) {
      useImpactStore.getState().setShareUrlHash(shareUrlHash);
    }
  };

  syncParamsToUrl(useImpactStore.getState().params);
  return useImpactStore.subscribe((state, previousState) => {
    if (state.params !== previousState.params) {
      syncParamsToUrl(state.params);
    }
  });
}

export function resetImpactStoreForTests(): void {
  cancelPendingImpactResult();
  useImpactStore.setState({
    params: DEFAULT_IMPACT_PARAMS,
    result: computeDomainImpactResult(DEFAULT_IMPACT_PARAMS),
    isComputing: false,
    scenarios: [],
    historicalEvents: HISTORICAL_EVENTS,
    selectedScenarioId: null,
    isResultsPanelOpen: true,
    isMethodologyPanelOpen: false,
    activeLocale: 'en',
    direction: 'ltr',
    shareUrlHash: '',
    layers: DEFAULT_LAYERS,
  });
}

export function readImpactStoreStorageForTests(): string | null {
  return getImpactStoreStorage().getItem(IMPACT_STORE_STORAGE_KEY);
}

export function clearImpactStoreStorageForTests(): void {
  getImpactStoreStorage().removeItem(IMPACT_STORE_STORAGE_KEY);
  memoryStorage.clear();
}
