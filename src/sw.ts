/// <reference lib="webworker" />

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import type { WorkboxPlugin } from 'workbox-core/types.js';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null;
    url: string;
  }>;
};

function cacheableResponse(statuses: number[]): WorkboxPlugin {
  const plugin = new CacheableResponsePlugin({ statuses });
  if (!plugin.cacheWillUpdate) {
    throw new Error('CacheableResponsePlugin missing cacheWillUpdate');
  }

  return { cacheWillUpdate: plugin.cacheWillUpdate };
}

function expiration(maxEntries: number, maxAgeSeconds: number): WorkboxPlugin {
  const plugin = new ExpirationPlugin({ maxEntries, maxAgeSeconds });
  if (!plugin.cachedResponseWillBeUsed || !plugin.cacheDidUpdate) {
    throw new Error('ExpirationPlugin missing lifecycle handlers');
  }

  return {
    cacheDidUpdate: plugin.cacheDidUpdate,
    cachedResponseWillBeUsed: plugin.cachedResponseWillBeUsed,
  };
}

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'html-v1',
      plugins: [cacheableResponse([200]), expiration(80, 24 * 60 * 60)],
    }),
    {
      denylist: [/^\/api\//, /^\/sw\.js$/, /\.json$/, /^\/manifest\.webmanifest$/],
    },
  ),
);

registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets-v1',
    plugins: [cacheableResponse([200]), expiration(120, 365 * 24 * 60 * 60)],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [cacheableResponse([0, 200]), expiration(120, 30 * 24 * 60 * 60)],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/locales/') && url.pathname.endsWith('.json'),
  new StaleWhileRevalidate({
    cacheName: 'locale-json-v1',
    plugins: [cacheableResponse([200])],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'font' || request.url.includes('/fonts/'),
  new StaleWhileRevalidate({
    cacheName: 'fonts-v1',
    plugins: [cacheableResponse([0, 200]), expiration(32, 365 * 24 * 60 * 60)],
  }),
);

registerRoute(
  ({ url }) => url.origin === 'https://tiles.openfreemap.org',
  new CacheFirst({
    cacheName: 'openfreemap-tiles-v1',
    plugins: [cacheableResponse([0, 200]), expiration(5000, 30 * 24 * 60 * 60)],
  }),
);
