import type { StateCreator } from 'zustand';
import type { AppStoreBase, ScenarioSlice } from '../lib/store/types';
import type { HistoricalEvent } from '../types';
import { degrees, kilogramsPerCubicMeter, latitude, longitude, meters, metersPerSecond } from '../types';
import { scheduleImpactResult } from './paramsSlice';

const MAX_SAVED_SCENARIOS = 10;

type StoreSlice<TSlice> = StateCreator<AppStoreBase, [], [], TSlice>;

export const HISTORICAL_EVENTS = [
  {
    kind: 'historical',
    id: 'chelyabinsk-2013',
    nameKey: 'scenario.historical.chelyabinsk.name',
    year: 2013,
    location: {
      lat: latitude(54.825),
      lng: longitude(61.116),
      label: 'Chelyabinsk',
    },
    params: {
      diameter: meters(20),
      density: kilogramsPerCubicMeter(3300),
      velocity: metersPerSecond(19_000),
      angle: degrees(18),
      location: {
        lat: latitude(54.825),
        lng: longitude(61.116),
        label: 'Chelyabinsk',
      },
      targetDensity: kilogramsPerCubicMeter(3000),
    },
    summaryKey: 'scenario.historical.chelyabinsk.summary',
  },
  {
    kind: 'historical',
    id: 'tunguska-1908',
    nameKey: 'scenario.historical.tunguska.name',
    year: 1908,
    location: {
      lat: latitude(60.886),
      lng: longitude(101.894),
      label: 'Tunguska',
    },
    params: {
      diameter: meters(60),
      density: kilogramsPerCubicMeter(2200),
      velocity: metersPerSecond(27_000),
      angle: degrees(30),
      location: {
        lat: latitude(60.886),
        lng: longitude(101.894),
        label: 'Tunguska',
      },
      targetDensity: kilogramsPerCubicMeter(3000),
    },
    summaryKey: 'scenario.historical.tunguska.summary',
  },
  {
    kind: 'historical',
    id: 'barringer-50000-bce',
    nameKey: 'scenario.historical.barringer.name',
    year: -50_000,
    location: {
      lat: latitude(35.027),
      lng: longitude(-111.022),
      label: 'Barringer Crater',
    },
    params: {
      diameter: meters(50),
      density: kilogramsPerCubicMeter(7800),
      velocity: metersPerSecond(13_000),
      angle: degrees(45),
      location: {
        lat: latitude(35.027),
        lng: longitude(-111.022),
        label: 'Barringer Crater',
      },
      targetDensity: kilogramsPerCubicMeter(3000),
    },
    summaryKey: 'scenario.historical.barringer.summary',
  },
  {
    kind: 'historical',
    id: 'chicxulub-66000000-bce',
    nameKey: 'scenario.historical.chicxulub.name',
    year: -66_000_000,
    location: {
      lat: latitude(21.4),
      lng: longitude(-89.5),
      label: 'Chicxulub',
    },
    params: {
      diameter: meters(10_000),
      density: kilogramsPerCubicMeter(3000),
      velocity: metersPerSecond(20_000),
      angle: degrees(45),
      location: {
        lat: latitude(21.4),
        lng: longitude(-89.5),
        label: 'Chicxulub',
      },
      targetDensity: kilogramsPerCubicMeter(3000),
    },
    summaryKey: 'scenario.historical.chicxulub.summary',
  },
] satisfies readonly HistoricalEvent[];

export const createScenariosSlice: StoreSlice<ScenarioSlice> = (set, get) => ({
  scenarios: [],
  historicalEvents: HISTORICAL_EVENTS,
  selectedScenarioId: null,
  saveScenario: (scenario) => {
    set((state) => ({
      scenarios: [scenario, ...state.scenarios.filter((savedScenario) => savedScenario.id !== scenario.id)].slice(
        0,
        MAX_SAVED_SCENARIOS,
      ),
      selectedScenarioId: scenario.id,
    }));
  },
  removeScenario: (scenarioId) => {
    set((state) => ({
      scenarios: state.scenarios.filter((scenario) => scenario.id !== scenarioId),
      selectedScenarioId: state.selectedScenarioId === scenarioId ? null : state.selectedScenarioId,
    }));
  },
  renameScenario: (scenarioId, name) => {
    const updatedAt = new Date().toISOString();
    set((state) => ({
      scenarios: state.scenarios.map((scenario) =>
        scenario.id === scenarioId ? { ...scenario, name, updatedAt } : scenario,
      ),
    }));
  },
  loadScenario: (scenario) => {
    set({
      params: scenario.params,
      selectedScenarioId: scenario.id,
    });
    scheduleImpactResult(set, get);
  },
  clearScenarios: () => {
    set({
      scenarios: [],
      selectedScenarioId: null,
    });
  },
});
