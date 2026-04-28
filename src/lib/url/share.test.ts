import { describe, expect, it } from 'vitest';
import type { AsteroidParams } from '../../types';
import { degrees, kilogramsPerCubicMeter, latitude, longitude, meters, metersPerSecond } from '../../types';
import { buildShareUrl, decodeShareUrl, encodeShareParams, encodeShareUrl } from './share';

const tunguskaParams: AsteroidParams = {
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

describe('share URL state', () => {
  it('encodes asteroid params into compact query params', () => {
    // given
    const params = tunguskaParams;

    // when
    const search = encodeShareUrl(params);

    // then
    expect(search).toBe('?d=60&rho=2200&v=27000&angle=30&lat=60.886&lng=101.894&td=3000');
  });

  it('decodes a valid share URL back into branded asteroid params', () => {
    // given
    const searchParams = new URLSearchParams('d=20&rho=3300&v=19000&angle=18&lat=54.825&lng=61.116&td=3000');

    // when
    const decodedParams = decodeShareUrl(searchParams, tunguskaParams);

    // then
    expect(decodedParams?.diameter).toBe(20);
    expect(decodedParams?.density).toBe(3300);
    expect(decodedParams?.velocity).toBe(19_000);
    expect(decodedParams?.angle).toBe(18);
    expect(decodedParams?.location.lat).toBe(54.825);
    expect(decodedParams?.location.lng).toBe(61.116);
    expect(decodedParams?.targetDensity).toBe(3000);
  });

  it('returns null when any supplied share param fails Zod validation', () => {
    // given
    const searchParams = new URLSearchParams('d=-9999&rho=3300&v=999999&angle=18&lat=54.825&lng=61.116');

    // when
    const decodedParams = decodeShareUrl(searchParams, tunguskaParams);

    // then
    expect(decodedParams).toBeNull();
  });

  it('uses fallback params for omitted values while validating provided aliases', () => {
    // given
    const searchParams = new URLSearchParams('diameter=100&velocity=20000');

    // when
    const decodedParams = decodeShareUrl(searchParams, tunguskaParams);

    // then
    expect(decodedParams?.diameter).toBe(100);
    expect(decodedParams?.velocity).toBe(20_000);
    expect(decodedParams?.density).toBe(tunguskaParams.density);
  });

  it('builds an absolute share URL from a page location', () => {
    // given
    const location = { origin: 'https://example.test', pathname: '/en/simulator' };

    // when
    const shareUrl = buildShareUrl(tunguskaParams, location);

    // then
    expect(shareUrl).toBe('https://example.test/en/simulator?d=60&rho=2200&v=27000&angle=30&lat=60.886&lng=101.894&td=3000');
  });

  it('returns stable params object order for generated query strings', () => {
    // given
    const params = tunguskaParams;

    // when
    const keys = Array.from(encodeShareParams(params).keys());

    // then
    expect(keys).toEqual(['d', 'rho', 'v', 'angle', 'lat', 'lng', 'td']);
  });
});
