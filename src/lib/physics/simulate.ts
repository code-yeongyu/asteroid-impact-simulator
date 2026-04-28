import {
  calculateAtmosphericOutcome,
  calculateCrater,
  calculateDeliveredEnergy,
  calculateEjecta,
  calculateFireball,
  calculateMass,
  calculateOverpressure,
  calculateSeismic,
  calculateThermalRadiation,
  classifyCivilizationRisk,
  classifyImpactor,
  normalizeImpactInput,
} from './calculations';
import type { ImpactInputLike, ImpactResult } from './types';

/**
 * Top-level pure orchestrator for the Collins-Melosh-Marcus 2005 asteroid impact calculation set.
 *
 * @see Collins, Melosh & Marcus 2005, MAPS 40(6), DOI 10.1111/j.1945-5100.2005.tb00157.x.
 */
export function simulateImpact(input: ImpactInputLike): ImpactResult {
  const normalizedInput = normalizeImpactInput(input);
  const massKg = calculateMass(normalizedInput);
  const atmosphere = calculateAtmosphericOutcome(normalizedInput);
  const energy = calculateDeliveredEnergy(normalizedInput);
  const crater = calculateCrater(normalizedInput, atmosphere.final_velocity_kms);
  const craterDiameterKm = crater?.diameter_km ?? null;

  return {
    mass_kg: massKg,
    kinetic_energy_J: energy.joules,
    kinetic_energy_Mt: energy.megatons,
    impactor_class: classifyImpactor(normalizedInput),
    atmospheric_outcome: atmosphere.outcome,
    burst_altitude_km: atmosphere.burst_altitude_km,
    final_velocity_kms: atmosphere.final_velocity_kms,
    crater_diameter_km: craterDiameterKm,
    crater_depth_km: crater?.depth_km ?? null,
    fireball_radius_km: calculateFireball(energy.megatons),
    thermal_radiation: calculateThermalRadiation(energy.megatons),
    overpressure: calculateOverpressure(energy.megatons),
    seismic: calculateSeismic(energy.megatons),
    ejecta_thickness: calculateEjecta(craterDiameterKm ?? 0),
    energyKilotons: energy.kilotons,
    energyMegatons: energy.megatons,
    energyTeratons: energy.teratons,
    craterKm: craterDiameterKm ?? 0,
    civilizationRisk: classifyCivilizationRisk(energy.megatons),
  };
}

export const simulate = simulateImpact;
