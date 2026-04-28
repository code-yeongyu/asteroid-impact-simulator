import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SavedScenario } from '../../types';
import { degrees, kilogramsPerCubicMeter, latitude, longitude, meters, metersPerSecond } from '../../types';
import { DEFAULT_IMPACT_PARAMS } from '../paramsSlice';
import { clearImpactStoreStorageForTests, resetImpactStoreForTests, useImpactStore } from '../impactStore';

function createScenario(index: number): SavedScenario {
  return {
    kind: 'scenario',
    id: `scenario-${index}`,
    name: `Scenario ${index}`,
    params: {
      diameter: meters(20 + index),
      density: kilogramsPerCubicMeter(3000),
      velocity: metersPerSecond(19_000),
      angle: degrees(30),
      location: {
        lat: latitude(37),
        lng: longitude(127),
      },
      targetDensity: kilogramsPerCubicMeter(3000),
    },
    createdAt: `2026-04-${String(index).padStart(2, '0')}T00:00:00.000Z`,
    updatedAt: `2026-04-${String(index).padStart(2, '0')}T00:00:00.000Z`,
  };
}

describe('impact store slices', () => {
  beforeEach(() => {
    clearImpactStoreStorageForTests();
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
  });

  afterEach(() => {
    resetImpactStoreForTests();
    clearImpactStoreStorageForTests();
  });

  it('updates parameter slice and computed mass synchronously', () => {
    // given
    const initialMass = useImpactStore.getState().mass;

    // when
    useImpactStore.getState().setDiameter(meters(120));

    // then
    expect(useImpactStore.getState().params.diameter).toBe(120);
    expect(useImpactStore.getState().mass).not.toBe(initialMass);
    expect(useImpactStore.getState().kineticEnergy).toBeGreaterThan(0);
  });

  it('resets parameters to Tunguska defaults', () => {
    // given
    useImpactStore.getState().setAngle(degrees(45));

    // when
    useImpactStore.getState().reset();

    // then
    expect(useImpactStore.getState().params).toEqual(DEFAULT_IMPACT_PARAMS);
  });

  it('toggles UI panels and damage layers', () => {
    // given
    const store = useImpactStore.getState();

    // when
    store.setResultsPanelOpen(false);
    store.setMethodologyPanelOpen(true);
    store.setLayerVisible('ejecta', false);
    store.setLocaleDirection('ar', 'rtl');

    // then
    expect(useImpactStore.getState().isResultsPanelOpen).toBe(false);
    expect(useImpactStore.getState().isMethodologyPanelOpen).toBe(true);
    expect(useImpactStore.getState().layers.ejecta).toBe(false);
    expect(useImpactStore.getState().activeLocale).toBe('ar');
    expect(useImpactStore.getState().direction).toBe('rtl');
  });

  it('keeps at most ten saved scenarios', () => {
    // given
    const scenarios = Array.from({ length: 11 }, (_, index) => createScenario(index + 1));

    // when
    for (const scenario of scenarios) {
      useImpactStore.getState().saveScenario(scenario);
    }

    // then
    const savedScenarios = useImpactStore.getState().scenarios;
    expect(savedScenarios).toHaveLength(10);
    expect(savedScenarios[0]?.id).toBe('scenario-11');
    expect(savedScenarios.at(-1)?.id).toBe('scenario-2');
  });

  it('renames, loads, and removes saved scenarios', () => {
    // given
    const scenario = createScenario(1);
    useImpactStore.getState().saveScenario(scenario);

    // when
    useImpactStore.getState().renameScenario(scenario.id, 'Renamed scenario');
    useImpactStore.getState().loadScenario(useImpactStore.getState().scenarios[0] ?? scenario);
    useImpactStore.getState().removeScenario(scenario.id);

    // then
    expect(useImpactStore.getState().params.diameter).toBe(scenario.params.diameter);
    expect(useImpactStore.getState().scenarios).toEqual([]);
    expect(useImpactStore.getState().selectedScenarioId).toBeNull();
  });
});
