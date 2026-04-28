import { impactInputSchema } from '../schemas';
import type { AsteroidParams } from '../../types';
import { degrees, kilogramsPerCubicMeter, latitude, longitude, meters, metersPerSecond } from '../../types';

const METERS_PER_KILOMETER = 1000;
const DECIMAL_PRECISION = 6;

const DEFAULT_SHARE_PARAMS: AsteroidParams = {
  diameter: meters(60),
  density: kilogramsPerCubicMeter(2200),
  velocity: metersPerSecond(27_000),
  angle: degrees(30),
  location: {
    lat: latitude(60.886),
    lng: longitude(101.894),
    label: 'Tunguska',
  },
  targetDensity: kilogramsPerCubicMeter(3000),
};

const SHARE_PARAM_ALIASES = [
  ['d', 'diameter'],
  ['rho', 'density'],
  ['v', 'velocity'],
  ['angle', 'theta'],
  ['lat'],
  ['lng', 'lon'],
  ['td', 'targetDensity'],
] as const;

type ParamAliases = (typeof SHARE_PARAM_ALIASES)[number];

interface RawShareValues {
  diameter?: number;
  density?: number;
  velocity?: number;
  angle?: number;
  lat?: number;
  lng?: number;
  targetDensity?: number;
}

function formatShareNumber(value: number): string {
  return Number(value.toFixed(DECIMAL_PRECISION)).toString();
}

function normalizeSearchParams(input: string | URLSearchParams): URLSearchParams {
  if (typeof input !== 'string') {
    return input;
  }

  return new URLSearchParams(input.startsWith('?') ? input.slice(1) : input);
}

function readAliasedValue(searchParams: URLSearchParams, aliases: ParamAliases): string | null {
  for (const alias of aliases) {
    const value = searchParams.get(alias);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function hasShareParam(searchParams: URLSearchParams): boolean {
  for (const aliases of SHARE_PARAM_ALIASES) {
    if (readAliasedValue(searchParams, aliases) !== null) {
      return true;
    }
  }

  return false;
}

function parseShareNumber(searchParams: URLSearchParams, aliases: ParamAliases): number | null | undefined {
  const value = readAliasedValue(searchParams, aliases);
  if (value === null) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function readRawShareValues(searchParams: URLSearchParams): RawShareValues | null {
  const diameter = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[0]);
  const density = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[1]);
  const velocity = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[2]);
  const angle = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[3]);
  const lat = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[4]);
  const lng = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[5]);
  const targetDensity = parseShareNumber(searchParams, SHARE_PARAM_ALIASES[6]);

  if (
    diameter === null ||
    density === null ||
    velocity === null ||
    angle === null ||
    lat === null ||
    lng === null ||
    targetDensity === null
  ) {
    return null;
  }

  return {
    ...(diameter === undefined ? {} : { diameter }),
    ...(density === undefined ? {} : { density }),
    ...(velocity === undefined ? {} : { velocity }),
    ...(angle === undefined ? {} : { angle }),
    ...(lat === undefined ? {} : { lat }),
    ...(lng === undefined ? {} : { lng }),
    ...(targetDensity === undefined ? {} : { targetDensity }),
  };
}

function velocityForSchema(velocityMetersPerSecond: number): number {
  return velocityMetersPerSecond / METERS_PER_KILOMETER;
}

export function encodeShareParams(params: AsteroidParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('d', formatShareNumber(params.diameter));
  searchParams.set('rho', formatShareNumber(params.density));
  searchParams.set('v', formatShareNumber(params.velocity));
  searchParams.set('angle', formatShareNumber(params.angle));
  searchParams.set('lat', formatShareNumber(params.location.lat));
  searchParams.set('lng', formatShareNumber(params.location.lng));
  searchParams.set('td', formatShareNumber(params.targetDensity));
  return searchParams;
}

export function encodeShareUrl(params: AsteroidParams): string {
  return `?${encodeShareParams(params).toString()}`;
}

export function decodeShareUrl(input: string | URLSearchParams, fallbackParams: AsteroidParams = DEFAULT_SHARE_PARAMS): AsteroidParams | null {
  const searchParams = normalizeSearchParams(input);
  if (!hasShareParam(searchParams)) {
    return null;
  }

  const rawValues = readRawShareValues(searchParams);
  if (rawValues === null) {
    return null;
  }

  const candidate = {
    diameter: rawValues.diameter ?? fallbackParams.diameter,
    density: rawValues.density ?? fallbackParams.density,
    velocity: velocityForSchema(rawValues.velocity ?? fallbackParams.velocity),
    angle: rawValues.angle ?? fallbackParams.angle,
    location: {
      ...fallbackParams.location,
      lat: rawValues.lat ?? fallbackParams.location.lat,
      lng: rawValues.lng ?? fallbackParams.location.lng,
    },
    targetDensity: rawValues.targetDensity ?? fallbackParams.targetDensity,
  };

  const parsed = impactInputSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export function buildShareUrl(params: AsteroidParams, location: Pick<Location, 'origin' | 'pathname'>): string {
  return `${location.origin}${location.pathname}${encodeShareUrl(params)}`;
}

export function buildCurrentShareUrl(params: AsteroidParams): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return buildShareUrl(params, window.location);
}

export function replaceCurrentShareUrl(params: AsteroidParams): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const search = encodeShareUrl(params);
  const nextUrl = `${window.location.pathname}${search}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
  return search;
}
