import type {
  AsteroidParams,
  Degrees,
  DomainImpactResult,
  HistoricalEvent,
  Joules,
  Kilograms,
  KilogramsPerCubicMeter,
  LocationPick,
  Meters,
  MetersPerSecond,
  SavedScenario,
  Scenario,
} from '../../types';

export interface SimSlice {
  params: AsteroidParams;
  mass: Kilograms | null;
  kineticEnergy: Joules | null;
  result: DomainImpactResult | null;
  isComputing: boolean;
  setDiameter: (diameter: Meters) => void;
  setDensity: (density: KilogramsPerCubicMeter) => void;
  setVelocity: (velocity: MetersPerSecond) => void;
  setAngle: (angle: Degrees) => void;
  setLocation: (location: LocationPick) => void;
  setTargetDensity: (targetDensity: KilogramsPerCubicMeter) => void;
  applyPreset: (params: AsteroidParams) => void;
  hydrateFromUrlSearch: (search: string) => void;
  computeResultNow: () => void;
  reset: () => void;
}

export interface ComputedSimSlice {
  mass: Kilograms | null;
  kineticEnergy: Joules | null;
}

export type SimStateSlice = Omit<SimSlice, keyof ComputedSimSlice>;

export interface ScenarioSlice {
  scenarios: readonly SavedScenario[];
  historicalEvents: readonly HistoricalEvent[];
  selectedScenarioId: string | null;
  saveScenario: (scenario: SavedScenario) => void;
  removeScenario: (scenarioId: string) => void;
  renameScenario: (scenarioId: string, name: string) => void;
  loadScenario: (scenario: Scenario) => void;
  clearScenarios: () => void;
}

export interface UISlice {
  isResultsPanelOpen: boolean;
  isMethodologyPanelOpen: boolean;
  activeLocale: string;
  direction: 'ltr' | 'rtl';
  shareUrlHash: string;
  layers: {
    fireball: boolean;
    thermal: boolean;
    overpressure: boolean;
    ejecta: boolean;
  };
  setResultsPanelOpen: (isOpen: boolean) => void;
  setMethodologyPanelOpen: (isOpen: boolean) => void;
  setLayerVisible: (layer: keyof UISlice['layers'], isVisible: boolean) => void;
  setLocaleDirection: (locale: string, direction: UISlice['direction']) => void;
  setShareUrlHash: (shareUrlHash: string) => void;
}

export type AppStoreBase = SimStateSlice & ScenarioSlice & UISlice;

export type AppStore = AppStoreBase & ComputedSimSlice;

export interface PersistedImpactState {
  params: AsteroidParams;
  scenarios: readonly SavedScenario[];
  selectedScenarioId: string | null;
}

export type ImpactStoreSchema = AppStore;
