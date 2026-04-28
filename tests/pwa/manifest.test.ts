import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { pwaManifest } from '../../src/pwa/manifest';

const distManifestPath = resolve(process.cwd(), 'dist/manifest.webmanifest');

function readDistManifest(): typeof pwaManifest {
  const manifestJson = readFileSync(distManifestPath, 'utf8');
  return JSON.parse(manifestJson) as typeof pwaManifest;
}

describe('pwaManifest', () => {
  it('uses the locked cosmic colors and app shell fields', () => {
    // given
    const manifest = pwaManifest;

    // when
    const requiredFields = {
      backgroundColor: manifest.background_color,
      display: manifest.display,
      scope: manifest.scope,
      startUrl: manifest.start_url,
      themeColor: manifest.theme_color,
    };

    // then
    expect(requiredFields).toEqual({
      backgroundColor: '#03060c',
      display: 'standalone',
      scope: '/',
      startUrl: '/',
      themeColor: '#5cf2ff',
    });
  });

  it('declares standard and maskable png icons', () => {
    // given
    const iconSources = pwaManifest.icons?.map((icon) => icon.src) ?? [];

    // when
    const maskableIcon = pwaManifest.icons?.find((icon) => icon.purpose === 'maskable');

    // then
    expect(iconSources).toEqual(['/icon-192.png', '/icon-512.png', '/icon-maskable-512.png']);
    expect(maskableIcon).toMatchObject({ sizes: '512x512', type: 'image/png' });
  });

  it('does not include out-of-scope integration fields', () => {
    // given
    const manifestKeys = Object.keys(pwaManifest);

    // when
    const unsupportedKeys = ['share_target', 'protocol_handlers', 'file_handlers'].filter((key) =>
      manifestKeys.includes(key),
    );

    // then
    expect(unsupportedKeys).toEqual([]);
  });

  it('emits a valid web app manifest when dist exists', () => {
    // given
    const manifest = existsSync(distManifestPath) ? readDistManifest() : pwaManifest;

    // when
    const iconCount = manifest.icons?.length ?? 0;

    // then
    expect(manifest.name).toBe('Asteroid Impact Simulator');
    expect(manifest.short_name).toBe('AsteroidSim');
    expect(manifest.theme_color).toBe('#5cf2ff');
    expect(manifest.background_color).toBe('#03060c');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(iconCount).toBeGreaterThanOrEqual(3);
  });
});
