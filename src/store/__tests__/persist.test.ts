import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PersistedImpactState } from '../../lib/store/types';
import { meters } from '../../types';
import {
  clearImpactStoreStorageForTests,
  hydrateImpactStoreFromLocation,
  resetImpactStoreForTests,
  readImpactStoreStorageForTests,
  useImpactStore,
} from '../impactStore';

interface PersistedPayload {
  state: PersistedImpactState;
  version?: number;
}

function readPersistedPayload(): PersistedPayload {
  const rawPayload = readImpactStoreStorageForTests();
  if (rawPayload === null) {
    throw new Error('Expected persisted impact store payload');
  }

  return JSON.parse(rawPayload) as PersistedPayload;
}

describe('impact store persistence and hydration', () => {
  beforeEach(() => {
    clearImpactStoreStorageForTests();
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
  });

  afterEach(() => {
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
  });

  it('persists params to localStorage when diameter changes', () => {
    // given
    const diameter = meters(500);

    // when
    useImpactStore.getState().setDiameter(diameter);

    // then
    const persistedPayload = readPersistedPayload();
    expect(persistedPayload.state.params.diameter).toBe(500);
    expect(persistedPayload.state.scenarios).toEqual([]);
  });

  it('hydrates supported URL aliases into store params', () => {
    // given
    const search = '?d=20&v=19000&rho=3300&angle=18&lat=54.825&lng=61.116';

    // when
    hydrateImpactStoreFromLocation(search);

    // then
    const params = useImpactStore.getState().params;
    expect(params.diameter).toBe(20);
    expect(params.velocity).toBe(19_000);
    expect(params.density).toBe(3300);
    expect(params.angle).toBe(18);
    expect(params.location.lat).toBe(54.825);
    expect(params.location.lng).toBe(61.116);
  });
});
