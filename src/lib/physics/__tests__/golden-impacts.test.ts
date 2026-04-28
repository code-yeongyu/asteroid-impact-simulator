import { describe, expect, it } from 'vitest';
import { simulate, simulateImpact } from '../index';
import type { ImpactInput } from '../index';

function expectWithinPercent(actual: number, expected: number, percent: number): void {
  const tolerance = expected * (percent / 100);

  expect(actual).toBeGreaterThanOrEqual(expected - tolerance);
  expect(actual).toBeLessThanOrEqual(expected + tolerance);
}

describe('reference impacts (Collins-Melosh-Marcus 2005)', () => {
  it('matches Chelyabinsk 2013 energy within 5 percent', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 20,
      density_kgm3: 3300,
      velocity_kms: 19,
      angle_deg: 18,
      target_density_kgm3: 3000,
    };

    // when
    const result = simulateImpact(input);

    // then
    expectWithinPercent(result.energyKilotons, 440, 5);
    expect(result.atmospheric_outcome).toBe('airburst');
  });

  it('matches Tunguska 1908 energy within 5 percent', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 60,
      density_kgm3: 2200,
      velocity_kms: 27,
      angle_deg: 30,
      target_density_kgm3: 3000,
    };

    // when
    const result = simulateImpact(input);

    // then
    expectWithinPercent(result.energyMegatons, 12, 5);
    expect(result.atmospheric_outcome).toBe('airburst');
  });

  it('matches Barringer Crater energy within 5 percent', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 50,
      density_kgm3: 7800,
      velocity_kms: 13,
      angle_deg: 45,
      target_density_kgm3: 3000,
    };

    // when
    const result = simulateImpact(input);

    // then
    expectWithinPercent(result.energyMegatons, 10, 5);
    expect(result.crater_diameter_km).not.toBeNull();
  });

  it('matches Chicxulub K-Pg energy within 5 percent', () => {
    // given
    const input: ImpactInput = {
      diameter_m: 10_000,
      density_kgm3: 3000,
      velocity_kms: 20,
      angle_deg: 60,
      target_density_kgm3: 3000,
    };

    // when
    const result = simulateImpact(input);

    // then
    expectWithinPercent(result.energyTeratons, 100, 5);
    expect(result.civilizationRisk).toBe('extinction');
  });

  it('supports the plan legacy input names for golden fixtures', () => {
    // given
    const legacyInput = { diameter: 20, density: 3300, velocity: 19_000, angle: 18 };

    // when
    const result = simulate(legacyInput);

    // then
    expectWithinPercent(result.energyKilotons, 440, 5);
  });
});
