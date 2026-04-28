import type { AtmosphericOutcome, CivilizationRisk as PhysicsCivilizationRisk, ImpactorClass, OverpressureRadii, SeismicResult, ThermalRadiationRadii } from '../lib/physics';
import type {
  Degrees,
  Joules,
  Kilograms,
  KilogramsPerCubicMeter,
  Kilometers,
  Latitude,
  Longitude,
  Megatons,
  Meters,
  MetersPerSecond,
} from './branded';

export const CIVILIZATION_RISK = {
  Negligible: 'negligible',
  Local: 'local',
  Regional: 'regional',
  Continental: 'continental',
  Global: 'global',
  Extinction: 'extinction',
} as const satisfies Record<string, PhysicsCivilizationRisk>;

export type CivilizationRisk = (typeof CIVILIZATION_RISK)[keyof typeof CIVILIZATION_RISK];

export type TorinoLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type TimelinePoint = '1s' | '1min' | '1h' | '1d' | '1y';

export type DamageZoneKind =
  | 'fireball'
  | 'thermal_3rd_degree'
  | 'thermal_2nd_degree'
  | 'clothing_ignition'
  | 'overpressure_lethal'
  | 'building_collapse'
  | 'window_break'
  | 'ejecta_thick'
  | 'ejecta_thin';

export interface LocationPick {
  lat: Latitude;
  lng: Longitude;
  label?: string;
}

export interface AsteroidParams {
  diameter: Meters;
  density: KilogramsPerCubicMeter;
  velocity: MetersPerSecond;
  angle: Degrees;
  location: LocationPick;
  targetDensity: KilogramsPerCubicMeter;
}

export interface DamageZone {
  kind: DamageZoneKind;
  radiusKm: Kilometers;
  intensity: 'low' | 'moderate' | 'severe' | 'extreme';
}

export interface TimelineSnapshot {
  at: TimelinePoint;
  state: 'entry' | 'impact' | 'blast' | 'thermal' | 'seismic' | 'aftermath';
  titleKey: string;
  descriptionKey: string;
}

export interface DomainImpactResult {
  mass: Kilograms;
  kineticEnergy: Joules;
  kineticEnergyMt: Megatons;
  impactorClass: ImpactorClass;
  atmosphericOutcome: AtmosphericOutcome;
  burstAltitude: Kilometers | null;
  finalVelocity: MetersPerSecond;
  craterDiameter: Kilometers | null;
  craterDepth: Kilometers | null;
  fireballRadius: Kilometers;
  damageZones: readonly DamageZone[];
  timeline: readonly TimelineSnapshot[];
  civilizationRisk: CivilizationRisk;
  torinoEquivalent: TorinoLevel;
  kinetic_energy_J: number;
  energyMegatons: number;
  crater_diameter_km: number | null;
  crater_depth_km: number | null;
  fireball_radius_km: number;
  overpressure: OverpressureRadii;
  thermal_radiation: ThermalRadiationRadii;
  seismic: SeismicResult;
}

export interface ImpactResultRow {
  id: string;
  labelKey: string;
  value: string;
  unit: 'kg' | 'J' | 'kt' | 'Mt' | 'Tt' | 'km' | 'm/s' | 'Mw' | 'tier';
  risk?: CivilizationRisk;
}

export interface SavedScenario {
  kind: 'scenario';
  id: string;
  name: string;
  params: AsteroidParams;
  createdAt: string;
  updatedAt: string;
}

export interface HistoricalEvent {
  kind: 'historical';
  id: string;
  nameKey: string;
  year: number;
  location: LocationPick;
  params: AsteroidParams;
  summaryKey: string;
}

export type Scenario = SavedScenario | HistoricalEvent;
