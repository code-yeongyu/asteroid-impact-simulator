import type { StateCreator } from 'zustand';
import * as physics from '../lib/physics';
import type { AppStoreBase, SimStateSlice } from '../lib/store/types';
import type { AsteroidParams, DamageZone, DomainImpactResult, LocationPick, TimelineSnapshot, TorinoLevel } from '../types';
import {
  degrees,
  joules,
  kilograms,
  kilogramsPerCubicMeter,
  kilometers,
  latitude,
  longitude,
  megatons,
  meters,
  metersPerSecond,
} from '../types';

const DIAMETER_MIN_METERS = 1;
const DIAMETER_MAX_METERS = 10_000;
const VELOCITY_MIN_METERS_PER_SECOND = 11_000;
const VELOCITY_MAX_METERS_PER_SECOND = 72_000;
const ANGLE_MIN_DEGREES = 1;
const ANGLE_MAX_DEGREES = 89;
const DENSITY_MIN_KGM3 = 1000;
const DENSITY_MAX_KGM3 = 8000;
const METERS_PER_KILOMETER = 1000;
const RESULT_DEBOUNCE_MS = 200;

type StoreSet = Parameters<StateCreator<AppStoreBase>>[0];
type StoreGet = Parameters<StateCreator<AppStoreBase>>[1];
type StoreSlice<TSlice> = StateCreator<AppStoreBase, [], [], TSlice>;

let resultTimer: ReturnType<typeof setTimeout> | null = null;

export const DEFAULT_IMPACT_LOCATION: LocationPick = {
  lat: latitude(60.886),
  lng: longitude(101.894),
  label: 'Tunguska',
};

export const DEFAULT_IMPACT_PARAMS: AsteroidParams = {
  diameter: meters(60),
  density: kilogramsPerCubicMeter(2200),
  velocity: metersPerSecond(27_000),
  angle: degrees(30),
  location: DEFAULT_IMPACT_LOCATION,
  targetDensity: kilogramsPerCubicMeter(3000),
};

const TIMELINE: readonly TimelineSnapshot[] = [
  {
    at: '1s',
    state: 'entry',
    titleKey: 'simulator.timeline.entry.title',
    descriptionKey: 'simulator.timeline.entry.description',
  },
  {
    at: '1min',
    state: 'impact',
    titleKey: 'simulator.timeline.impact.title',
    descriptionKey: 'simulator.timeline.impact.description',
  },
  {
    at: '1h',
    state: 'blast',
    titleKey: 'simulator.timeline.blast.title',
    descriptionKey: 'simulator.timeline.blast.description',
  },
  {
    at: '1d',
    state: 'thermal',
    titleKey: 'simulator.timeline.thermal.title',
    descriptionKey: 'simulator.timeline.thermal.description',
  },
  {
    at: '1y',
    state: 'aftermath',
    titleKey: 'simulator.timeline.aftermath.title',
    descriptionKey: 'simulator.timeline.aftermath.description',
  },
];

function toPhysicsInput(params: AsteroidParams): physics.LegacyImpactInput {
  return {
    diameter: params.diameter,
    density: params.density,
    velocity: params.velocity,
    angle: params.angle,
    targetDensity: params.targetDensity,
  };
}

function toTorinoEquivalent(risk: DomainImpactResult['civilizationRisk']): TorinoLevel {
  switch (risk) {
    case 'negligible':
      return 0;
    case 'local':
      return 3;
    case 'regional':
      return 5;
    case 'continental':
      return 7;
    case 'global':
      return 9;
    case 'extinction':
      return 10;
  }
}

function toDamageZones(result: physics.ImpactResult): readonly DamageZone[] {
  return [
    {
      kind: 'fireball',
      radiusKm: kilometers(result.fireball_radius_km),
      intensity: 'extreme',
    },
    {
      kind: 'thermal_3rd_degree',
      radiusKm: kilometers(result.thermal_radiation.burns_3rd_km),
      intensity: 'severe',
    },
    {
      kind: 'thermal_2nd_degree',
      radiusKm: kilometers(result.thermal_radiation.burns_2nd_km),
      intensity: 'moderate',
    },
    {
      kind: 'clothing_ignition',
      radiusKm: kilometers(result.thermal_radiation.clothing_ignites_km),
      intensity: 'extreme',
    },
    {
      kind: 'overpressure_lethal',
      radiusKm: kilometers(result.overpressure.lethal_psi_km),
      intensity: 'extreme',
    },
    {
      kind: 'building_collapse',
      radiusKm: kilometers(result.overpressure.building_collapse_km),
      intensity: 'severe',
    },
    {
      kind: 'window_break',
      radiusKm: kilometers(result.overpressure.window_break_km),
      intensity: 'low',
    },
    {
      kind: 'ejecta_thick',
      radiusKm: kilometers(result.ejecta_thickness.thick_km),
      intensity: 'severe',
    },
    {
      kind: 'ejecta_thin',
      radiusKm: kilometers(result.ejecta_thickness.thin_km),
      intensity: 'moderate',
    },
  ];
}

export function computeMass(params: AsteroidParams): DomainImpactResult['mass'] {
  const radiusMeters = params.diameter / 2;
  return kilograms((4 / 3) * Math.PI * radiusMeters ** 3 * params.density);
}

export function computeKineticEnergy(params: AsteroidParams): DomainImpactResult['kineticEnergy'] {
  return joules(0.5 * computeMass(params) * params.velocity ** 2);
}

export function computeDomainImpactResult(params: AsteroidParams): DomainImpactResult {
  const result = physics.simulate(toPhysicsInput(params));

  return {
    mass: kilograms(result.mass_kg),
    kineticEnergy: joules(result.kinetic_energy_J),
    kineticEnergyMt: megatons(result.kinetic_energy_Mt),
    impactorClass: result.impactor_class,
    atmosphericOutcome: result.atmospheric_outcome,
    burstAltitude: result.burst_altitude_km === null ? null : kilometers(result.burst_altitude_km),
    finalVelocity: metersPerSecond(result.final_velocity_kms * METERS_PER_KILOMETER),
    craterDiameter: result.crater_diameter_km === null ? null : kilometers(result.crater_diameter_km),
    craterDepth: result.crater_depth_km === null ? null : kilometers(result.crater_depth_km),
    fireballRadius: kilometers(result.fireball_radius_km),
    damageZones: toDamageZones(result),
    timeline: TIMELINE,
    civilizationRisk: result.civilizationRisk,
    torinoEquivalent: toTorinoEquivalent(result.civilizationRisk),
  };
}

function clearResultTimer(): void {
  if (resultTimer !== null) {
    clearTimeout(resultTimer);
    resultTimer = null;
  }
}

export function commitImpactResult(set: StoreSet, get: StoreGet): void {
  clearResultTimer();
  set({
    result: computeDomainImpactResult(get().params),
    isComputing: false,
  });
}

export function scheduleImpactResult(set: StoreSet, get: StoreGet): void {
  clearResultTimer();
  set({ isComputing: true });
  resultTimer = setTimeout(() => {
    resultTimer = null;
    set({
      result: computeDomainImpactResult(get().params),
      isComputing: false,
    });
  }, RESULT_DEBOUNCE_MS);
}

export function cancelPendingImpactResult(): void {
  clearResultTimer();
}

function readSearchValue(searchParams: URLSearchParams, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value !== null) {
      return value;
    }
  }
  return null;
}

function parseBoundedNumber(value: string | null, minimum: number, maximum: number): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < minimum || parsedValue > maximum) {
    return null;
  }

  return parsedValue;
}

function parseVelocity(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  const metersPerSecondValue = parsedValue > METERS_PER_KILOMETER ? parsedValue : parsedValue * METERS_PER_KILOMETER;
  if (
    metersPerSecondValue < VELOCITY_MIN_METERS_PER_SECOND ||
    metersPerSecondValue > VELOCITY_MAX_METERS_PER_SECOND
  ) {
    return null;
  }

  return metersPerSecondValue;
}

function createParamsFromSearch(search: string, currentParams: AsteroidParams): AsteroidParams | null {
  const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const diameter = parseBoundedNumber(
    readSearchValue(searchParams, ['d', 'diameter']),
    DIAMETER_MIN_METERS,
    DIAMETER_MAX_METERS,
  );
  const density = parseBoundedNumber(readSearchValue(searchParams, ['rho', 'density']), DENSITY_MIN_KGM3, DENSITY_MAX_KGM3);
  const velocity = parseVelocity(readSearchValue(searchParams, ['v', 'velocity']));
  const angle = parseBoundedNumber(
    readSearchValue(searchParams, ['theta', 'angle']),
    ANGLE_MIN_DEGREES,
    ANGLE_MAX_DEGREES,
  );
  const lat = parseBoundedNumber(readSearchValue(searchParams, ['lat']), -90, 90);
  const lng = parseBoundedNumber(readSearchValue(searchParams, ['lng', 'lon']), -180, 180);

  if (diameter === null && density === null && velocity === null && angle === null && lat === null && lng === null) {
    return null;
  }

  return {
    ...currentParams,
    diameter: diameter === null ? currentParams.diameter : meters(diameter),
    density: density === null ? currentParams.density : kilogramsPerCubicMeter(density),
    velocity: velocity === null ? currentParams.velocity : metersPerSecond(velocity),
    angle: angle === null ? currentParams.angle : degrees(angle),
    location: {
      ...currentParams.location,
      lat: lat === null ? currentParams.location.lat : latitude(lat),
      lng: lng === null ? currentParams.location.lng : longitude(lng),
    },
  };
}

export const createParamsSlice: StoreSlice<SimStateSlice> = (set, get) => ({
  params: DEFAULT_IMPACT_PARAMS,
  result: computeDomainImpactResult(DEFAULT_IMPACT_PARAMS),
  isComputing: false,
  setDiameter: (diameter) => {
    set((state) => ({ params: { ...state.params, diameter } }));
    scheduleImpactResult(set, get);
  },
  setDensity: (density) => {
    set((state) => ({ params: { ...state.params, density } }));
    scheduleImpactResult(set, get);
  },
  setVelocity: (velocity) => {
    set((state) => ({ params: { ...state.params, velocity } }));
    scheduleImpactResult(set, get);
  },
  setAngle: (angle) => {
    set((state) => ({ params: { ...state.params, angle } }));
    scheduleImpactResult(set, get);
  },
  setLocation: (location) => {
    set((state) => ({ params: { ...state.params, location } }));
    scheduleImpactResult(set, get);
  },
  setTargetDensity: (targetDensity) => {
    set((state) => ({ params: { ...state.params, targetDensity } }));
    scheduleImpactResult(set, get);
  },
  applyPreset: (params) => {
    set({ params });
    scheduleImpactResult(set, get);
  },
  hydrateFromUrlSearch: (search) => {
    const params = createParamsFromSearch(search, get().params);
    if (params === null) {
      return;
    }

    set({ params });
    scheduleImpactResult(set, get);
  },
  computeResultNow: () => {
    commitImpactResult(set, get);
  },
  reset: () => {
    set({ params: DEFAULT_IMPACT_PARAMS });
    scheduleImpactResult(set, get);
  },
});
