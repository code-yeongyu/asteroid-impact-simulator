/* v8 ignore file -- type contracts only */

export type ImpactorClass = 'cometary' | 'rocky' | 'iron';

export type AtmosphericOutcome = 'airburst' | 'fragments' | 'intact';

export type CivilizationRisk =
  | 'negligible'
  | 'local'
  | 'regional'
  | 'continental'
  | 'global'
  | 'extinction';

export interface ImpactInput {
  diameter_m: number;
  velocity_kms: number;
  angle_deg: number;
  density_kgm3: number;
  target_density_kgm3: number;
}

export interface LegacyImpactInput {
  diameter: number;
  density: number;
  velocity: number;
  angle: number;
  targetDensity?: number;
}

export type ImpactInputLike = ImpactInput | LegacyImpactInput;

export interface EnergyEquivalent {
  joules: number;
  kilotons: number;
  megatons: number;
  teratons: number;
}

export interface AtmosphericCalculation {
  outcome: AtmosphericOutcome;
  burstAlt: number | null;
  finalV: number;
  burst_altitude_km: number | null;
  final_velocity_kms: number;
  energy_fraction: number;
}

export interface CraterCalculation {
  diameter_km: number;
  depth_km: number;
  transient_diameter_km: number;
}

export interface ThermalRadiationRadii {
  burns_3rd_km: number;
  burns_2nd_km: number;
  clothing_ignites_km: number;
}

export interface OverpressureRadii {
  lethal_psi_km: number;
  building_collapse_km: number;
  window_break_km: number;
}

export interface SeismicResult {
  magnitude_mw: number;
  felt_km: number;
}

export interface EjectaThicknessRadii {
  thick_km: number;
  thin_km: number;
}

export interface ImpactResult {
  mass_kg: number;
  kinetic_energy_J: number;
  kinetic_energy_Mt: number;
  impactor_class: ImpactorClass;
  atmospheric_outcome: AtmosphericOutcome;
  burst_altitude_km: number | null;
  final_velocity_kms: number;
  crater_diameter_km: number | null;
  crater_depth_km: number | null;
  fireball_radius_km: number;
  thermal_radiation: ThermalRadiationRadii;
  overpressure: OverpressureRadii;
  seismic: SeismicResult;
  ejecta_thickness: EjectaThicknessRadii;
  energyKilotons: number;
  energyMegatons: number;
  energyTeratons: number;
  craterKm: number;
  civilizationRisk: CivilizationRisk;
}
