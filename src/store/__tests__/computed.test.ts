import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as physics from '../../lib/physics';
import { meters } from '../../types';
import { useImpactResult } from '../hooks';
import { clearImpactStoreStorageForTests, resetImpactStoreForTests, useImpactStore } from '../impactStore';

describe('impact store computed state', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearImpactStoreStorageForTests();
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      resetImpactStoreForTests();
    });
    clearImpactStoreStorageForTests();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('debounces impact result recomputation when params change', () => {
    // given
    const simulateSpy = vi.spyOn(physics, 'simulate');

    // when
    useImpactStore.getState().setDiameter(meters(500));

    // then
    expect(useImpactStore.getState().isComputing).toBe(true);
    expect(simulateSpy).toHaveBeenCalledTimes(0);

    // when
    vi.advanceTimersByTime(199);

    // then
    expect(simulateSpy).toHaveBeenCalledTimes(0);

    // when
    vi.advanceTimersByTime(1);

    // then
    expect(simulateSpy).toHaveBeenCalledTimes(1);
    expect(useImpactStore.getState().isComputing).toBe(false);
    expect(useImpactStore.getState().result?.mass).toBeGreaterThan(0);
  });

  it('does not recompute impact result when unrelated UI state changes', () => {
    // given
    const simulateSpy = vi.spyOn(physics, 'simulate');
    useImpactStore.getState().setDiameter(meters(120));
    vi.advanceTimersByTime(200);
    expect(simulateSpy).toHaveBeenCalledTimes(1);

    // when
    useImpactStore.getState().setResultsPanelOpen(false);
    useImpactStore.getState().setLayerVisible('thermal', false);
    useImpactStore.getState().setShareUrlHash('#d=120');
    vi.advanceTimersByTime(400);

    // then
    expect(simulateSpy).toHaveBeenCalledTimes(1);
  });

  it('memoizes useImpactResult across unrelated store updates', () => {
    // given
    const { result } = renderHook(() => useImpactResult());
    const initialSnapshot = result.current;

    // when
    act(() => {
      useImpactStore.getState().setShareUrlHash('#unchanged-result');
      useImpactStore.getState().setMethodologyPanelOpen(true);
    });

    // then
    expect(result.current).toBe(initialSnapshot);
  });
});
