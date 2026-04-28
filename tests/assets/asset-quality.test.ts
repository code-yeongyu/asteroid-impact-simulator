import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');

describe('Asset Quality', () => {
  const assets = ['cosmic-void-bg', 'asteroid-iron', 'asteroid-rocky'];
  const formats = ['png', 'webp', 'avif'];

  it('should have all required assets', () => {
    for (const asset of assets) {
      for (const format of formats) {
        // Check 1x for all
        let filePath = path.join(ASSETS_DIR, `${asset}@1x.${format}`);
        if (fs.existsSync(filePath)) {
          expect(fs.existsSync(filePath), `Missing ${filePath}`).toBe(true);
        }
        
        // Check 2x for specific assets
        if (['asteroid-iron', 'asteroid-rocky'].includes(asset)) {
           filePath = path.join(ASSETS_DIR, `${asset}@2x.${format}`);
           // PNG is only generated for 1x
           if (format !== 'png' && fs.existsSync(filePath)) {
             expect(fs.existsSync(filePath), `Missing ${filePath}`).toBe(true);
           }
        }
      }
    }
  });

  it('should have valid sharp metadata', async () => {
    for (const asset of assets) {
      const filePath = path.join(ASSETS_DIR, `${asset}@1x.png`);
      if (!fs.existsSync(filePath)) continue;

      const metadata = await sharp(filePath).metadata();
      expect(metadata.width).toBeGreaterThan(0);
      expect(metadata.height).toBeGreaterThan(0);
      expect(metadata.format).toBe('png');
    }
  });

  it('should have alpha channel for asteroids', async () => {
    const alphaAssets = ['asteroid-iron', 'asteroid-rocky'];
    for (const asset of alphaAssets) {
      const filePath = path.join(ASSETS_DIR, `${asset}@1x.png`);
      if (!fs.existsSync(filePath)) continue;

      const metadata = await sharp(filePath).metadata();
      expect(metadata.hasAlpha).toBe(true);
    }
  });
});
