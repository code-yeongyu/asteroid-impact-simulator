import type { ManifestOptions } from 'vite-plugin-pwa';

export const pwaManifest = {
  name: 'Asteroid Impact Simulator',
  short_name: 'AsteroidSim',
  description: 'Scientifically grounded asteroid impact simulator',
  theme_color: '#5cf2ff',
  background_color: '#03060c',
  display: 'standalone',
  orientation: 'any',
  scope: '/',
  start_url: '/',
  categories: ['education', 'utilities'],
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
} satisfies Partial<ManifestOptions>;
