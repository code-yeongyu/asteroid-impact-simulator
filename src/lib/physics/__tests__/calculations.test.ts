import { describe, expect, it } from 'vitest';
import {
  calculateAtmosphericOutcome,
  calculateCompressiveStrength,
  calculateCrater,
  calculateDeliveredEnergy,
  calculateEjecta,
  calculateFireball,
  calculateKineticEnergy,
  calculateMass,
  calculateOverpressure,
  calculateSeismic,
  calculateThermalRadiation,
  classifyCivilizationRisk,
  classifyImpactor,
  energyEquivalentFromJoules,
  joulesToMegatons,
  joulesToTeratons,
  megatonsToJoules,
  normalizeImpactInput,
  simulateImpact,
  validateImpactInput,
} from '../index';
import type { ImpactInput } from '../index';

const barringerInput: ImpactInput = {
  diameter_m: 50,
  density_kgm3: 7800,
  velocity_kms: 13,
  angle_deg: 45,
  target_density_kgm3: 3000,
};

describe('physics calculations', () => {
  it('calculates spherical mass from diameter and density', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 10,
      density_kgm3: 3000,
      velocity_kms: 20,
      angle_deg: 45,
      target_density_kgm3: 3000,
    };

    // when
    const mass = calculateMass(input);

    // then
    expect(mass).toBeCloseTo((4 / 3) * Math.PI * 5 ** 3 * 3000, 6);
  });

  it('calculates initial kinetic energy in joules', () => {
    // given
    const expectedMegatons = 10.31;

    // when
    const joules = calculateKineticEnergy(barringerInput);

    // then
    expect(joulesToMegatons(joules)).toBeCloseTo(expectedMegatons, 1);
  });

  it('classifies small rocky impactors as airbursts after atmospheric breakup', () => {
    // given
    const chelyabinskInput: ImpactInput = {
      diameter_m: 20,
      density_kgm3: 3300,
      velocity_kms: 19,
      angle_deg: 18,
      target_density_kgm3: 3000,
    };

    // when
    const atmosphere = calculateAtmosphericOutcome(chelyabinskInput);

    // then
    expect(atmosphere.outcome).toBe('airburst');
    expect(atmosphere.burst_altitude_km).not.toBeNull();
    expect(atmosphere.final_velocity_kms).toBeLessThan(chelyabinskInput.velocity_kms);
  });

  it('classifies mid-sized rocky impactors as atmospheric fragments', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 200,
      density_kgm3: 3000,
      velocity_kms: 20,
      angle_deg: 45,
      target_density_kgm3: 3000,
    };

    // when
    const atmosphere = calculateAtmosphericOutcome(input);

    // then
    expect(atmosphere.outcome).toBe('fragments');
    expect(atmosphere.burst_altitude_km).toBeGreaterThan(0);
  });

  it('classifies density classes for cometary, rocky, and iron impactors', () => {
    // given
    const baseInput: ImpactInput = {
      diameter_m: 30,
      density_kgm3: 3000,
      velocity_kms: 20,
      angle_deg: 45,
      target_density_kgm3: 3000,
    };

    // when
    const cometaryClass = classifyImpactor({ ...baseInput, density_kgm3: 1500 });
    const rockyClass = classifyImpactor(baseInput);
    const ironClass = classifyImpactor({ ...baseInput, density_kgm3: 7800 });

    // then
    expect(cometaryClass).toBe('cometary');
    expect(rockyClass).toBe('rocky');
    expect(ironClass).toBe('iron');
  });

  it('normalizes legacy inputs using meters-per-second or kilometers-per-second velocity', () => {
    // given
    const metersPerSecondInput = { diameter: 20, density: 3300, velocity: 19_000, angle: 18 };
    const kilometersPerSecondInput = { diameter: 20, density: 3300, velocity: 19, angle: 18 };

    // when
    const normalizedMeters = normalizeImpactInput(metersPerSecondInput);
    const normalizedKilometers = normalizeImpactInput(kilometersPerSecondInput);

    // then
    expect(normalizedMeters.velocity_kms).toBe(19);
    expect(normalizedKilometers.velocity_kms).toBe(19);
    expect(normalizedMeters.target_density_kgm3).toBe(3000);
  });

  it('calculates compressive strength and delivered energy equivalents', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 20,
      density_kgm3: 3300,
      velocity_kms: 19,
      angle_deg: 18,
      target_density_kgm3: 3000,
    };

    // when
    const strengthPascals = calculateCompressiveStrength(input);
    const deliveredEnergy = calculateDeliveredEnergy(input);

    // then
    expect(strengthPascals).toBeGreaterThan(0);
    expect(deliveredEnergy.kilotons).toBeGreaterThan(400);
    expect(joulesToTeratons(megatonsToJoules(1_000_000))).toBeCloseTo(1, 12);
  });

  it('rejects each out-of-range input bound with clear validation errors', () => {
    // given
    const validInput: ImpactInput = {
      diameter_m: 20,
      density_kgm3: 3300,
      velocity_kms: 19,
      angle_deg: 18,
      target_density_kgm3: 3000,
    };

    // when / then
    expect(() => validateImpactInput({ ...validInput, diameter_m: Number.NaN })).toThrow(/diameter_m must be finite/);
    expect(() => validateImpactInput({ ...validInput, diameter_m: 10_001 })).toThrow(/diameter_m must be <= 10000/);
    expect(() => validateImpactInput({ ...validInput, velocity_kms: 11 })).toThrow(/velocity_kms must be between/);
    expect(() => validateImpactInput({ ...validInput, velocity_kms: 73 })).toThrow(/velocity_kms must be between/);
    expect(() => validateImpactInput({ ...validInput, angle_deg: 0 })).toThrow(/angle_deg must be between/);
    expect(() => validateImpactInput({ ...validInput, angle_deg: 90 })).toThrow(/angle_deg must be between/);
    expect(() => validateImpactInput({ ...validInput, density_kgm3: 999 })).toThrow(/density_kgm3 must be between/);
    expect(() => validateImpactInput({ ...validInput, density_kgm3: 8001 })).toThrow(/density_kgm3 must be between/);
    expect(() => validateImpactInput({ ...validInput, target_density_kgm3: 999 })).toThrow(/target_density_kgm3 must be between/);
    expect(() => validateImpactInput({ ...validInput, target_density_kgm3: 8001 })).toThrow(/target_density_kgm3 must be between/);
  });

  it('rejects non-positive standalone energy conversions', () => {
    // given
    const invalidEnergy = 0;

    // when / then
    expect(() => energyEquivalentFromJoules(invalidEnergy)).toThrow(/energy must be > 0/);
    expect(() => calculateFireball(invalidEnergy)).toThrow(/energyMegatons must be > 0/);
    expect(() => calculateThermalRadiation(invalidEnergy)).toThrow(/energyMegatons must be > 0/);
    expect(() => calculateOverpressure(invalidEnergy)).toThrow(/energyMegatons must be > 0/);
    expect(() => calculateSeismic(invalidEnergy)).toThrow(/energyMegatons must be > 0/);
  });

  it('returns a crater for intact iron impactors', () => {
    // given
    const atmosphere = calculateAtmosphericOutcome(barringerInput);

    // when
    const crater = calculateCrater(barringerInput, atmosphere.final_velocity_kms);

    // then
    expect(crater).not.toBeNull();
    expect(crater?.diameter_km).toBeGreaterThan(1);
    expect(crater?.depth_km).toBeCloseTo((crater?.diameter_km ?? 0) / 5, 6);
  });

  it('calculates requested fireball radius power law', () => {
    // given
    const energyMegatons = 12;

    // when
    const radiusKm = calculateFireball(energyMegatons);

    // then
    expect(radiusKm).toBeCloseTo(0.4 * energyMegatons ** 0.4, 12);
  });

  it('orders thermal burn and ignition radii by fluence threshold', () => {
    // given
    const energyMegatons = 12;

    // when
    const thermal = calculateThermalRadiation(energyMegatons);

    // then
    expect(thermal.burns_2nd_km).toBeGreaterThan(thermal.burns_3rd_km);
    expect(thermal.burns_3rd_km).toBeGreaterThan(thermal.clothing_ignites_km);
  });

  it('orders blast radii by overpressure threshold', () => {
    // given
    const energyMegatons = 12;

    // when
    const overpressure = calculateOverpressure(energyMegatons);

    // then
    expect(overpressure.window_break_km).toBeGreaterThan(overpressure.building_collapse_km);
    expect(overpressure.building_collapse_km).toBeGreaterThan(overpressure.lethal_psi_km);
  });

  it('calculates seismic magnitude from joule energy relation', () => {
    // given
    const energyMegatons = 10;

    // when
    const seismic = calculateSeismic(energyMegatons);

    // then
    expect(seismic.magnitude_mw).toBeCloseTo(0.67 * Math.log10(energyMegatons * 4.184e15) - 5.87, 12);
    expect(seismic.felt_km).toBeGreaterThan(0);
  });

  it('calculates ejecta display radii from final crater diameter', () => {
    // given
    const craterDiameterKm = 1.2;

    // when
    const ejecta = calculateEjecta(craterDiameterKm);

    // then
    expect(ejecta.thick_km).toBeCloseTo(6, 12);
    expect(ejecta.thin_km).toBeCloseTo(120, 12);
  });

  it('returns zero ejecta radii when no crater is present', () => {
    // given
    const craterDiameterKm = 0;

    // when
    const ejecta = calculateEjecta(craterDiameterKm);

    // then
    expect(ejecta.thick_km).toBe(0);
    expect(ejecta.thin_km).toBe(0);
  });

  it('classifies all civilization risk tiers by megaton yield', () => {
    // given
    const yieldsMegatons = [0.5, 10, 500, 50_000, 5_000_000, 100_000_000] as const;

    // when
    const tiers = yieldsMegatons.map((yieldMegatons) => classifyCivilizationRisk(yieldMegatons));

    // then
    expect(tiers).toEqual(['negligible', 'local', 'regional', 'continental', 'global', 'extinction']);
  });

  it('rejects invalid inputs before producing non-physical results', () => {
    // given
    const invalidInput: ImpactInput = {
      diameter_m: 0,
      density_kgm3: 3000,
      velocity_kms: 20,
      angle_deg: 45,
      target_density_kgm3: 3000,
    };

    // when / then
    expect(() => simulateImpact(invalidInput)).toThrow(/diameter must be > 0/);
  });

  it('keeps very large impact results finite', () => {
    // given
    const chicxulubInput: ImpactInput = {
      diameter_m: 10_000,
      density_kgm3: 3000,
      velocity_kms: 20,
      angle_deg: 60,
      target_density_kgm3: 3000,
    };

    // when
    const result = simulateImpact(chicxulubInput);

    // then
    expect(Number.isFinite(result.kinetic_energy_J)).toBe(true);
    expect(Number.isFinite(result.fireball_radius_km)).toBe(true);
    expect(result.civilizationRisk).toBe('extinction');
  });
});
