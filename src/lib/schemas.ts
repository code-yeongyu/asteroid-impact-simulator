import { z } from 'zod';
import {
  degrees,
  kilogramsPerCubicMeter,
  latitude,
  longitude,
  meters,
  metersPerSecond,
} from '../types/branded';

const DIAMETER_MIN_METERS = 1;
const DIAMETER_MAX_METERS = 10_000;
const VELOCITY_MIN_KMS = 11;
const VELOCITY_MAX_KMS = 72;
const ANGLE_MIN_DEGREES = 1;
const ANGLE_MAX_DEGREES = 89;
const DENSITY_MIN_KGM3 = 1000;
const DENSITY_MAX_KGM3 = 8000;
const DEFAULT_TARGET_DENSITY_KGM3 = 3000;
const METERS_PER_KILOMETER = 1000;

const VALIDATION_KEYS = {
  diameterNumber: 'validation.impact.diameter.number',
  diameterMin: 'validation.impact.diameter.min',
  diameterMax: 'validation.impact.diameter.max',
  densityNumber: 'validation.impact.density.number',
  densityMin: 'validation.impact.density.min',
  densityMax: 'validation.impact.density.max',
  velocityNumber: 'validation.impact.velocity.number',
  velocityMin: 'validation.impact.velocity.min',
  velocityMax: 'validation.impact.velocity.max',
  angleNumber: 'validation.impact.angle.number',
  angleMin: 'validation.impact.angle.min',
  angleMax: 'validation.impact.angle.max',
  targetDensityNumber: 'validation.impact.targetDensity.number',
  targetDensityMin: 'validation.impact.targetDensity.min',
  targetDensityMax: 'validation.impact.targetDensity.max',
  latitudeNumber: 'validation.location.lat.number',
  latitudeMin: 'validation.location.lat.min',
  latitudeMax: 'validation.location.lat.max',
  longitudeNumber: 'validation.location.lng.number',
  longitudeMin: 'validation.location.lng.min',
  longitudeMax: 'validation.location.lng.max',
  labelMin: 'validation.location.label.min',
  labelMax: 'validation.location.label.max',
  scenarioId: 'validation.scenario.id.uuid',
  scenarioNameMin: 'validation.scenario.name.min',
  scenarioNameMax: 'validation.scenario.name.max',
  scenarioCreatedAt: 'validation.scenario.createdAt.required',
  scenarioUpdatedAt: 'validation.scenario.updatedAt.required',
  historicalId: 'validation.historical.id.required',
  historicalNameKey: 'validation.historical.nameKey.required',
  historicalYearNumber: 'validation.historical.year.number',
  historicalYearInteger: 'validation.historical.year.integer',
  historicalSummaryKey: 'validation.historical.summaryKey.required',
} as const;

function finiteNumberSchema(errorKey: string): z.ZodCoercedNumber {
  return z.coerce.number(errorKey).refine(Number.isFinite, { message: errorKey });
}

export const locationSchema = z.object({
  lat: finiteNumberSchema(VALIDATION_KEYS.latitudeNumber)
    .min(-90, VALIDATION_KEYS.latitudeMin)
    .max(90, VALIDATION_KEYS.latitudeMax)
    .transform(latitude),
  lng: finiteNumberSchema(VALIDATION_KEYS.longitudeNumber)
    .min(-180, VALIDATION_KEYS.longitudeMin)
    .max(180, VALIDATION_KEYS.longitudeMax)
    .transform(longitude),
  label: z.string().trim().min(1, VALIDATION_KEYS.labelMin).max(120, VALIDATION_KEYS.labelMax).optional(),
});

export const impactInputSchema = z.object({
  diameter: finiteNumberSchema(VALIDATION_KEYS.diameterNumber)
    .min(DIAMETER_MIN_METERS, VALIDATION_KEYS.diameterMin)
    .max(DIAMETER_MAX_METERS, VALIDATION_KEYS.diameterMax)
    .transform(meters),
  density: finiteNumberSchema(VALIDATION_KEYS.densityNumber)
    .min(DENSITY_MIN_KGM3, VALIDATION_KEYS.densityMin)
    .max(DENSITY_MAX_KGM3, VALIDATION_KEYS.densityMax)
    .transform(kilogramsPerCubicMeter),
  velocity: finiteNumberSchema(VALIDATION_KEYS.velocityNumber)
    .min(VELOCITY_MIN_KMS, VALIDATION_KEYS.velocityMin)
    .max(VELOCITY_MAX_KMS, VALIDATION_KEYS.velocityMax)
    .transform((velocityKms) => metersPerSecond(velocityKms * METERS_PER_KILOMETER)),
  angle: finiteNumberSchema(VALIDATION_KEYS.angleNumber)
    .min(ANGLE_MIN_DEGREES, VALIDATION_KEYS.angleMin)
    .max(ANGLE_MAX_DEGREES, VALIDATION_KEYS.angleMax)
    .transform(degrees),
  location: locationSchema,
  targetDensity: finiteNumberSchema(VALIDATION_KEYS.targetDensityNumber)
    .min(DENSITY_MIN_KGM3, VALIDATION_KEYS.targetDensityMin)
    .max(DENSITY_MAX_KGM3, VALIDATION_KEYS.targetDensityMax)
    .default(DEFAULT_TARGET_DENSITY_KGM3)
    .transform(kilogramsPerCubicMeter),
});

export const savedScenarioSchema = z.object({
  kind: z.literal('scenario'),
  id: z.uuid(VALIDATION_KEYS.scenarioId),
  name: z.string().trim().min(1, VALIDATION_KEYS.scenarioNameMin).max(80, VALIDATION_KEYS.scenarioNameMax),
  params: impactInputSchema,
  createdAt: z.string().trim().min(1, VALIDATION_KEYS.scenarioCreatedAt),
  updatedAt: z.string().trim().min(1, VALIDATION_KEYS.scenarioUpdatedAt),
});

export const historicalEventSchema = z.object({
  kind: z.literal('historical'),
  id: z.string().trim().min(1, VALIDATION_KEYS.historicalId),
  nameKey: z.string().trim().min(1, VALIDATION_KEYS.historicalNameKey),
  year: finiteNumberSchema(VALIDATION_KEYS.historicalYearNumber).int(VALIDATION_KEYS.historicalYearInteger),
  location: locationSchema,
  params: impactInputSchema,
  summaryKey: z.string().trim().min(1, VALIDATION_KEYS.historicalSummaryKey),
});

export const scenarioSchema = z.discriminatedUnion('kind', [savedScenarioSchema, historicalEventSchema]);

export const urlStateSchema = z.object({
  diameter: finiteNumberSchema(VALIDATION_KEYS.diameterNumber)
    .min(DIAMETER_MIN_METERS, VALIDATION_KEYS.diameterMin)
    .max(DIAMETER_MAX_METERS, VALIDATION_KEYS.diameterMax)
    .optional(),
  density: finiteNumberSchema(VALIDATION_KEYS.densityNumber)
    .min(DENSITY_MIN_KGM3, VALIDATION_KEYS.densityMin)
    .max(DENSITY_MAX_KGM3, VALIDATION_KEYS.densityMax)
    .optional(),
  velocity: finiteNumberSchema(VALIDATION_KEYS.velocityNumber)
    .min(VELOCITY_MIN_KMS, VALIDATION_KEYS.velocityMin)
    .max(VELOCITY_MAX_KMS, VALIDATION_KEYS.velocityMax)
    .optional(),
  angle: finiteNumberSchema(VALIDATION_KEYS.angleNumber)
    .min(ANGLE_MIN_DEGREES, VALIDATION_KEYS.angleMin)
    .max(ANGLE_MAX_DEGREES, VALIDATION_KEYS.angleMax)
    .optional(),
  lat: finiteNumberSchema(VALIDATION_KEYS.latitudeNumber)
    .min(-90, VALIDATION_KEYS.latitudeMin)
    .max(90, VALIDATION_KEYS.latitudeMax)
    .optional(),
  lng: finiteNumberSchema(VALIDATION_KEYS.longitudeNumber)
    .min(-180, VALIDATION_KEYS.longitudeMin)
    .max(180, VALIDATION_KEYS.longitudeMax)
    .optional(),
});

export type ImpactInputForm = z.input<typeof impactInputSchema>;
export type ParsedHistoricalEvent = z.infer<typeof historicalEventSchema>;
export type ParsedImpactInput = z.infer<typeof impactInputSchema>;
export type ParsedLocation = z.infer<typeof locationSchema>;
export type ParsedSavedScenario = z.infer<typeof savedScenarioSchema>;
export type ParsedScenario = z.infer<typeof scenarioSchema>;
export type ParsedUrlState = z.infer<typeof urlStateSchema>;
