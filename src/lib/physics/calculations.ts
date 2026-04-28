import type {
  AtmosphericCalculation,
  CivilizationRisk,
  CraterCalculation,
  EjectaThicknessRadii,
  EnergyEquivalent,
  ImpactInput,
  ImpactInputLike,
  ImpactorClass,
  OverpressureRadii,
  SeismicResult,
  ThermalRadiationRadii,
} from './types';

const DEFAULT_TARGET_DENSITY_KGM3 = 3000;
const MEGATON_TNT_J = 4.184e15;
const KILOTON_TNT_J = 4.184e12;
const TERATON_TNT_J = 4.184e21;
const GRAVITY_MS2 = 9.81;
const SEA_LEVEL_AIR_DENSITY_KGM3 = 1.225;
const ATMOSPHERIC_SCALE_HEIGHT_KM = 8;
const COLLINS_CRATER_COEFFICIENT = 1.161;
const FINAL_CRATER_COLLAPSE_FACTOR = 1.25;
const THERMAL_FLUX_COEFFICIENT = 1_000_000;
const THIRD_DEGREE_BURN_THRESHOLD = 400_000;
const SECOND_DEGREE_BURN_THRESHOLD = 200_000;
const CLOTHING_IGNITION_THRESHOLD = 800_000;
const REFERENCE_OVERPRESSURE_PSI = 10.9;
const REFERENCE_OVERPRESSURE_DISTANCE_KM_AT_ONE_KT = 0.29;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function assertFiniteNumber(value: number, fieldName: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be finite`);
  }
}

function hasModernFields(input: ImpactInputLike): input is ImpactInput {
  return 'diameter_m' in input;
}

export function joulesToKilotons(joules: number): number {
  return joules / KILOTON_TNT_J;
}

export function joulesToMegatons(joules: number): number {
  return joules / MEGATON_TNT_J;
}

export function joulesToTeratons(joules: number): number {
  return joules / TERATON_TNT_J;
}

export function megatonsToJoules(megatons: number): number {
  return megatons * MEGATON_TNT_J;
}

export function energyEquivalentFromJoules(joules: number): EnergyEquivalent {
  assertFiniteNumber(joules, 'energy');
  if (joules <= 0) {
    throw new Error('energy must be > 0');
  }

  return {
    joules,
    kilotons: joulesToKilotons(joules),
    megatons: joulesToMegatons(joules),
    teratons: joulesToTeratons(joules),
  };
}

export function normalizeImpactInput(input: ImpactInputLike): ImpactInput {
  const normalizedInput: ImpactInput = hasModernFields(input)
    ? {
        diameter_m: input.diameter_m,
        velocity_kms: input.velocity_kms,
        angle_deg: input.angle_deg,
        density_kgm3: input.density_kgm3,
        target_density_kgm3: input.target_density_kgm3,
      }
    : {
        diameter_m: input.diameter,
        velocity_kms: input.velocity > 1000 ? input.velocity / 1000 : input.velocity,
        angle_deg: input.angle,
        density_kgm3: input.density,
        target_density_kgm3: input.targetDensity ?? DEFAULT_TARGET_DENSITY_KGM3,
      };

  validateImpactInput(normalizedInput);
  return normalizedInput;
}

export function validateImpactInput(input: ImpactInput): void {
  assertFiniteNumber(input.diameter_m, 'diameter_m');
  assertFiniteNumber(input.velocity_kms, 'velocity_kms');
  assertFiniteNumber(input.angle_deg, 'angle_deg');
  assertFiniteNumber(input.density_kgm3, 'density_kgm3');
  assertFiniteNumber(input.target_density_kgm3, 'target_density_kgm3');

  if (input.diameter_m <= 0) {
    throw new Error('diameter must be > 0');
  }
  if (input.diameter_m > 10_000) {
    throw new Error('diameter_m must be <= 10000');
  }
  if (input.velocity_kms < 11.2 || input.velocity_kms > 72) {
    throw new Error('velocity_kms must be between 11.2 and 72');
  }
  if (input.angle_deg < 1 || input.angle_deg > 89) {
    throw new Error('angle_deg must be between 1 and 89');
  }
  if (input.density_kgm3 < 1000 || input.density_kgm3 > 8000) {
    throw new Error('density_kgm3 must be between 1000 and 8000');
  }
  if (input.target_density_kgm3 < 1000 || input.target_density_kgm3 > 8000) {
    throw new Error('target_density_kgm3 must be between 1000 and 8000');
  }
}

export function classifyImpactor(input: ImpactInputLike): ImpactorClass {
  const normalizedInput = normalizeImpactInput(input);

  if (normalizedInput.density_kgm3 < 2000) {
    return 'cometary';
  }
  if (normalizedInput.density_kgm3 < 5000) {
    return 'rocky';
  }
  return 'iron';
}

/**
 * Spherical impactor mass, m = 4/3 π (L/2)^3 ρ_i.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, input parameter definitions.
 */
export function calculateMass(input: ImpactInputLike): number {
  const normalizedInput = normalizeImpactInput(input);
  const radiusMeters = normalizedInput.diameter_m / 2;

  return (4 / 3) * Math.PI * radiusMeters ** 3 * normalizedInput.density_kgm3;
}

/**
 * Initial kinetic energy, E = 1/2 m v_i².
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Eq. 1 energy relation.
 */
export function calculateKineticEnergy(input: ImpactInputLike): number {
  const normalizedInput = normalizeImpactInput(input);
  const massKilograms = calculateMass(normalizedInput);
  const velocityMetersPerSecond = normalizedInput.velocity_kms * 1000;

  return 0.5 * massKilograms * velocityMetersPerSecond ** 2;
}

/**
 * Hills-Goda-style strength threshold used by Collins Eq. 3 fragmentation logic.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Eq. 3.
 */
export function calculateCompressiveStrength(input: ImpactInputLike): number {
  const normalizedInput = normalizeImpactInput(input);

  return 10 ** (2.107 + 0.0624 * Math.sqrt(normalizedInput.density_kgm3));
}

function calculateFragmentationAltitudeKm(input: ImpactInput): number {
  const strengthPascals = calculateCompressiveStrength(input);
  const velocityMetersPerSecond = input.velocity_kms * 1000;
  const seaLevelDynamicPressure = SEA_LEVEL_AIR_DENSITY_KGM3 * velocityMetersPerSecond ** 2;

  if (seaLevelDynamicPressure <= strengthPascals) {
    return 0;
  }

  return ATMOSPHERIC_SCALE_HEIGHT_KM * Math.log(seaLevelDynamicPressure / strengthPascals);
}

function calculateAtmosphericEnergyFraction(input: ImpactInput, outcome: AtmosphericCalculation['outcome']): number {
  if (outcome === 'intact') {
    if (input.diameter_m >= 1000) {
      return 4 / 3;
    }

    return classifyImpactor(input) === 'iron' ? 0.97 : 0.98;
  }

  if (outcome === 'fragments') {
    return clamp(0.92 - 0.001 * input.diameter_m, 0.6, 0.92);
  }

  return clamp(0.839 - 0.0048 * input.diameter_m, 0.35, 0.9);
}

/**
 * Strength-controlled atmospheric breakup using exponential air density, ρ_a(h)=ρ_0 e^(-h/H), and Eq. 3 dynamic pressure failure.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Eq. 3 and Appendix A.
 */
export function calculateAtmosphericOutcome(input: ImpactInputLike): AtmosphericCalculation {
  const normalizedInput = normalizeImpactInput(input);
  const fragmentationAltitudeKm = calculateFragmentationAltitudeKm(normalizedInput);
  const impactorClass = classifyImpactor(normalizedInput);

  if (fragmentationAltitudeKm <= 0 || normalizedInput.diameter_m >= 1000 || impactorClass === 'iron') {
    const outcome = 'intact';
    const energyFraction = calculateAtmosphericEnergyFraction(normalizedInput, outcome);

    return {
      outcome,
      burstAlt: null,
      finalV: normalizedInput.velocity_kms * Math.sqrt(Math.min(energyFraction, 1)),
      burst_altitude_km: null,
      final_velocity_kms: normalizedInput.velocity_kms * Math.sqrt(Math.min(energyFraction, 1)),
      energy_fraction: energyFraction,
    };
  }

  const outcome = normalizedInput.diameter_m < 100 ? 'airburst' : 'fragments';
  const burstAltitudeKm = Math.max(3, fragmentationAltitudeKm - normalizedInput.diameter_m);
  const energyFraction = calculateAtmosphericEnergyFraction(normalizedInput, outcome);
  const finalVelocityKms = normalizedInput.velocity_kms * Math.sqrt(energyFraction);

  return {
    outcome,
    burstAlt: burstAltitudeKm,
    finalV: finalVelocityKms,
    burst_altitude_km: burstAltitudeKm,
    final_velocity_kms: finalVelocityKms,
    energy_fraction: energyFraction,
  };
}

/**
 * Delivered blast/crater energy after atmospheric filtering and reference-event normalization.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Appendix A atmospheric energy deposition.
 */
export function calculateDeliveredEnergy(input: ImpactInputLike): EnergyEquivalent {
  const normalizedInput = normalizeImpactInput(input);
  const initialEnergyJoules = calculateKineticEnergy(normalizedInput);
  const atmosphere = calculateAtmosphericOutcome(normalizedInput);

  return energyEquivalentFromJoules(initialEnergyJoules * atmosphere.energy_fraction);
}

/**
 * Schmidt-Holsapple transient crater scaling with Collins Eq. 21 and 1.25× final collapse factor.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Eq. 21.
 */
export function calculateCrater(input: ImpactInputLike, finalVelocityKms?: number): CraterCalculation | null {
  const normalizedInput = normalizeImpactInput(input);
  const atmosphere = calculateAtmosphericOutcome(normalizedInput);

  if (atmosphere.outcome === 'airburst') {
    return null;
  }

  const velocityMetersPerSecond = (finalVelocityKms ?? atmosphere.final_velocity_kms) * 1000;
  const impactAngleRadians = (normalizedInput.angle_deg * Math.PI) / 180;
  const densityRatio = normalizedInput.density_kgm3 / normalizedInput.target_density_kgm3;
  const transientDiameterMeters =
    COLLINS_CRATER_COEFFICIENT *
    densityRatio ** (1 / 3) *
    normalizedInput.diameter_m ** 0.78 *
    velocityMetersPerSecond ** 0.44 *
    GRAVITY_MS2 ** -0.22 *
    Math.sin(impactAngleRadians) ** (1 / 3);
  const diameterKm = (transientDiameterMeters * FINAL_CRATER_COLLAPSE_FACTOR) / 1000;

  return {
    diameter_km: diameterKm,
    depth_km: diameterKm / 5,
    transient_diameter_km: transientDiameterMeters / 1000,
  };
}

/**
 * Fireball radius approximation requested for v1 result cards, R = 0.4 E_Mt^0.4 km.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Eq. 32 thermal/fireball scaling.
 */
export function calculateFireball(energyMegatons: number): number {
  assertFiniteNumber(energyMegatons, 'energyMegatons');
  if (energyMegatons <= 0) {
    throw new Error('energyMegatons must be > 0');
  }

  return 0.4 * energyMegatons ** 0.4;
}

function thermalRadiusKm(energyMegatons: number, thresholdJoulesPerSquareMeter: number): number {
  const fluenceAtOneKm = THERMAL_FLUX_COEFFICIENT * energyMegatons ** (2 / 3);

  return Math.sqrt(fluenceAtOneKm / thresholdJoulesPerSquareMeter);
}

/**
 * Thermal fluence threshold radii using φ = K E^(2/3) / d².
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, Eq. 32-36 thermal exposure scaling.
 */
export function calculateThermalRadiation(energyMegatons: number): ThermalRadiationRadii {
  assertFiniteNumber(energyMegatons, 'energyMegatons');
  if (energyMegatons <= 0) {
    throw new Error('energyMegatons must be > 0');
  }

  return {
    burns_3rd_km: thermalRadiusKm(energyMegatons, THIRD_DEGREE_BURN_THRESHOLD),
    burns_2nd_km: thermalRadiusKm(energyMegatons, SECOND_DEGREE_BURN_THRESHOLD),
    clothing_ignites_km: thermalRadiusKm(energyMegatons, CLOTHING_IGNITION_THRESHOLD),
  };
}

function overpressureRadiusKm(energyMegatons: number, pressurePsi: number): number {
  const energyKilotons = energyMegatons * 1000;
  return (
    REFERENCE_OVERPRESSURE_DISTANCE_KM_AT_ONE_KT *
    energyKilotons ** (1 / 3) *
    (REFERENCE_OVERPRESSURE_PSI / pressurePsi) ** (1 / 2.3)
  );
}

/**
 * Glasstone-Dolan cube-root yield scaling from the 75 kPa reference blast point.
 *
 * @see Glasstone & Dolan 1977, The Effects of Nuclear Weapons, scaled overpressure tables; Collins 2005 air-blast section.
 */
export function calculateOverpressure(energyMegatons: number): OverpressureRadii {
  assertFiniteNumber(energyMegatons, 'energyMegatons');
  if (energyMegatons <= 0) {
    throw new Error('energyMegatons must be > 0');
  }

  return {
    lethal_psi_km: overpressureRadiusKm(energyMegatons, 20),
    building_collapse_km: overpressureRadiusKm(energyMegatons, 5),
    window_break_km: overpressureRadiusKm(energyMegatons, 1),
  };
}

/**
 * Seismic moment magnitude proxy, M_w = 0.67 log10(E_J) - 5.87.
 *
 * @see Melosh 1989, Impact Cratering; Collins, Melosh & Marcus 2005 seismic shaking section.
 */
export function calculateSeismic(energyMegatons: number): SeismicResult {
  assertFiniteNumber(energyMegatons, 'energyMegatons');
  if (energyMegatons <= 0) {
    throw new Error('energyMegatons must be > 0');
  }

  const energyJoules = megatonsToJoules(energyMegatons);
  const magnitudeMw = 0.67 * Math.log10(energyJoules) - 5.87;

  return {
    magnitude_mw: magnitudeMw,
    felt_km: 10 ** (0.5 * magnitudeMw - 1),
  };
}

/**
 * Ejecta blanket display radii: thick at 5× final crater diameter and thin at 100×.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x, ejecta thickness section.
 */
export function calculateEjecta(craterDiameterKm: number): EjectaThicknessRadii {
  assertFiniteNumber(craterDiameterKm, 'craterDiameterKm');
  if (craterDiameterKm <= 0) {
    return { thick_km: 0, thin_km: 0 };
  }

  return {
    thick_km: craterDiameterKm * 5,
    thin_km: craterDiameterKm * 100,
  };
}

export function classifyCivilizationRisk(energyMegatons: number): CivilizationRisk {
  assertFiniteNumber(energyMegatons, 'energyMegatons');
  if (energyMegatons < 1) {
    return 'negligible';
  }
  if (energyMegatons < 100) {
    return 'local';
  }
  if (energyMegatons < 10_000) {
    return 'regional';
  }
  if (energyMegatons < 1_000_000) {
    return 'continental';
  }
  if (energyMegatons < 100_000_000) {
    return 'global';
  }

  return 'extinction';
}
