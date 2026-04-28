import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('service worker configuration', () => {
  it('uses injectManifest precache and cleanup primitives', () => {
    // given
    const serviceWorkerSource = readFileSync('src/sw.ts', 'utf8');

    // when
    const requiredPrimitives = ['precacheAndRoute(self.__WB_MANIFEST)', 'cleanupOutdatedCaches()'];

    // then
    expect(requiredPrimitives.every((primitive) => serviceWorkerSource.includes(primitive))).toBe(true);
  });

  it('registers a CacheFirst route for OpenFreeMap tiles with opaque responses', () => {
    // given
    const serviceWorkerSource = readFileSync('src/sw.ts', 'utf8');

    // when
    const hasOpenFreeMapRoute = serviceWorkerSource.includes(
      "url.origin === 'https://tiles.openfreemap.org'",
    );
    const hasOpaqueCaching = serviceWorkerSource.includes('cacheableResponse([0, 200])');
    const hasTileBudget = serviceWorkerSource.includes('expiration(5000, 30 * 24 * 60 * 60)');

    // then
    expect({ hasOpenFreeMapRoute, hasOpaqueCaching, hasTileBudget }).toEqual({
      hasOpenFreeMapRoute: true,
      hasOpaqueCaching: true,
      hasTileBudget: true,
    });
  });

  it('denies service worker navigation fallback for api and manifest assets', () => {
    // given
    const serviceWorkerSource = readFileSync('src/sw.ts', 'utf8');

    // when
    const denylistPatterns = ['/^\\/api\\//', '/^\\/sw\\.js$/', '/\\.json$/', '/^\\/manifest\\.webmanifest$/'];

    // then
    expect(denylistPatterns.every((pattern) => serviceWorkerSource.includes(pattern))).toBe(true);
  });
});
