import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { meters } from '../../types';
import {
  clearImpactStoreStorageForTests,
  hydrateImpactStoreFromLocation,
  resetImpactStoreForTests,
  startImpactStoreUrlSync,
  useImpactStore,
} from '../impactStore';
import { DEFAULT_IMPACT_PARAMS } from '../paramsSlice';

describe('impact store URL state sharing', () => {
  beforeEach(() => {
    clearImpactStoreStorageForTests();
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
    window.history.replaceState(null, '', '/en/simulator');
  });

  afterEach(() => {
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/en/simulator');
  });

  it('hydrates shared query params into the impact store', () => {
    // given
    const search = '?d=20&rho=3300&v=19000&angle=18&lat=54.825&lng=61.116&td=3000';

    // when
    hydrateImpactStoreFromLocation(search);

    // then
    expect(useImpactStore.getState().params.diameter).toBe(20);
    expect(useImpactStore.getState().params.velocity).toBe(19_000);
    expect(useImpactStore.getState().params.location.lat).toBe(54.825);
    expect(useImpactStore.getState().result?.mass).toBeGreaterThan(0);
  });

  it('ignores invalid shared query params and keeps Tunguska defaults', () => {
    // given
    const search = '?d=-9999&v=999999';

    // when
    hydrateImpactStoreFromLocation(search);

    // then
    expect(useImpactStore.getState().params).toEqual(DEFAULT_IMPACT_PARAMS);
  });

  it('replaces URL state on params changes without pushing history entries', () => {
    // given
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const stopSync = startImpactStoreUrlSync();

    // when
    useImpactStore.getState().setDiameter(meters(500));

    // then
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalled();
    expect(window.location.search).toContain('d=500');
    expect(useImpactStore.getState().shareUrlHash).toContain('d=500');

    stopSync();
  });
});
