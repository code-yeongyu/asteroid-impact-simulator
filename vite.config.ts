import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

import { pwaManifest } from './src/pwa/manifest';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      manifest: pwaManifest,
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,json}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (/react|react-dom|react-router/.test(id)) return 'vendor';
            if (/maplibre-gl|react-map-gl/.test(id)) return 'map';
            if (/three|@react-three|simplex-noise/.test(id)) return 'three';
            if (/recharts|@visx/.test(id)) return 'charts';
            if (/i18next|intl-messageformat/.test(id)) return 'i18n';
            if (/katex/.test(id)) return 'katex';
          }
          return undefined;
        },
      },
    },
  },
});
