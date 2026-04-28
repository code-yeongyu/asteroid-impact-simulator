/**
 * Golden physics test fixtures (±5% tolerance).
 *
 * SI units enforced via field suffixes: `_m`, `_kgm3`, `_ms`, `_deg`.
 *
 * Citations (DOIs) are kept inline so Athena's T4 implementation can be
 * traced to peer-reviewed sources without leaving the file:
 *   - Chelyabinsk 2013   — Brown et al. 2013, Nature 503        (10.1038/nature12741)
 *   - Tunguska 1908      — Boslough & Crawford 2008, IJIE 35    (10.1016/j.ijimpeng.2008.07.053)
 *   - Barringer Crater   — Kring 2007, MAPS 42                  (10.1111/j.1945-5100.2007.tb00567.x)
 *   - Chicxulub K-Pg     — Collins, Melosh & Marcus 2005, MAPS  (10.1111/j.1945-5100.2005.tb00157.x)
 *
 * Canonical input/expected ranges originate from plan §"Golden Physics
 * Tests" (.sisyphus/plans/asteroid-impact-simulator.md lines 405–437).
 */

export type EnergyUnit = 'kt' | 'Mt' | 'Tt';
export type CivilizationRiskTier =
  | 'negligible'
  | 'local'
  | 'regional'
  | 'continental'
  | 'global'
  | 'extinction';

export interface GoldenImpactInputs {
  readonly diameter_m: number;
  readonly density_kgm3: number;
  readonly velocity_ms: number;
  readonly angle_deg: number;
}

export interface GoldenEnergyExpectation {
  readonly unit: EnergyUnit;
  readonly min: number;
  readonly max: number;
}

export interface GoldenCraterExpectation {
  readonly approxKm: number;
  readonly precision: number;
}

export interface GoldenImpactExpectations {
  readonly energy: GoldenEnergyExpectation;
  readonly crater?: GoldenCraterExpectation;
  readonly civilizationRisk?: CivilizationRiskTier;
}

export interface GoldenImpactFixture {
  readonly name: string;
  readonly slug: string;
  readonly inputs: GoldenImpactInputs;
  readonly expected: GoldenImpactExpectations;
  readonly citation: string;
}

export const GOLDEN_IMPACTS = [
  {
    name: 'Chelyabinsk 2013',
    slug: 'chelyabinsk-2013',
    inputs: { diameter_m: 20, density_kgm3: 3300, velocity_ms: 19000, angle_deg: 18 },
    expected: { energy: { unit: 'kt', min: 420, max: 460 } },
    citation: 'Brown et al. 2013, Nature 503, 238–241 (10.1038/nature12741)',
  },
  {
    name: 'Tunguska 1908',
    slug: 'tunguska-1908',
    inputs: { diameter_m: 60, density_kgm3: 2200, velocity_ms: 27000, angle_deg: 30 },
    expected: { energy: { unit: 'Mt', min: 11, max: 13 } },
    citation: 'Boslough & Crawford 2008, IJIE 35, 1441–1448 (10.1016/j.ijimpeng.2008.07.053)',
  },
  {
    name: 'Barringer Crater (Meteor Crater, AZ)',
    slug: 'barringer-crater',
    inputs: { diameter_m: 50, density_kgm3: 7800, velocity_ms: 13000, angle_deg: 45 },
    expected: {
      energy: { unit: 'Mt', min: 8, max: 12 },
      crater: { approxKm: 1.2, precision: 1 },
    },
    citation: 'Kring 2007, MAPS 42, 1057–1071 (10.1111/j.1945-5100.2007.tb00567.x)',
  },
  {
    name: 'Chicxulub K-Pg',
    slug: 'chicxulub-kpg',
    inputs: { diameter_m: 10000, density_kgm3: 3000, velocity_ms: 20000, angle_deg: 60 },
    expected: {
      energy: { unit: 'Tt', min: 80, max: 120 },
      civilizationRisk: 'extinction',
    },
    citation:
      'Collins, Melosh & Marcus 2005, Earth Impact Effects Program (10.1111/j.1945-5100.2005.tb00157.x)',
  },
] as const satisfies readonly GoldenImpactFixture[];

export const GOLDEN_IMPACTS_COUNT = GOLDEN_IMPACTS.length;
