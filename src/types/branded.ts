export type Brand<TBrand extends string> = number & { readonly __brand: TBrand };

export type Joules = Brand<'Joules'>;
export type Kilotons = Brand<'Kilotons'>;
export type Megatons = Brand<'Megatons'>;
export type Teratons = Brand<'Teratons'>;
export type Meters = Brand<'Meters'>;
export type Kilometers = Brand<'Kilometers'>;
export type Kilograms = Brand<'Kilograms'>;
export type KilogramsPerCubicMeter = Brand<'KilogramsPerCubicMeter'>;
export type MetersPerSecond = Brand<'MetersPerSecond'>;
export type Degrees = Brand<'Degrees'>;
export type Latitude = Brand<'Latitude'>;
export type Longitude = Brand<'Longitude'>;

const METERS_PER_KILOMETER = 1000;
const JOULES_PER_KILOTON = 4.184e12;
const JOULES_PER_MEGATON = 4.184e15;
const JOULES_PER_TERATON = 4.184e21;

export function joules(value: number): Joules {
  return value as Joules;
}

export function kilotons(value: number): Kilotons {
  return value as Kilotons;
}

export function megatons(value: number): Megatons {
  return value as Megatons;
}

export function teratons(value: number): Teratons {
  return value as Teratons;
}

export function meters(value: number): Meters {
  return value as Meters;
}

export function kilometers(value: number): Kilometers {
  return value as Kilometers;
}

export function kilograms(value: number): Kilograms {
  return value as Kilograms;
}

export function kilogramsPerCubicMeter(value: number): KilogramsPerCubicMeter {
  return value as KilogramsPerCubicMeter;
}

export function metersPerSecond(value: number): MetersPerSecond {
  return value as MetersPerSecond;
}

export function degrees(value: number): Degrees {
  return value as Degrees;
}

export function latitude(value: number): Latitude {
  return value as Latitude;
}

export function longitude(value: number): Longitude {
  return value as Longitude;
}

export function metersToKm(value: Meters): Kilometers {
  return kilometers(value / METERS_PER_KILOMETER);
}

export function kilometersToMeters(value: Kilometers): Meters {
  return meters(value * METERS_PER_KILOMETER);
}

export function joulesToKilotons(value: Joules): Kilotons {
  return kilotons(value / JOULES_PER_KILOTON);
}

export function joulesToMegatons(value: Joules): Megatons {
  return megatons(value / JOULES_PER_MEGATON);
}

export function joulesToTeratons(value: Joules): Teratons {
  return teratons(value / JOULES_PER_TERATON);
}

export function megatonsToJoules(value: Megatons): Joules {
  return joules(value * JOULES_PER_MEGATON);
}
