/**
 * Chroma-key utility — strip a flat green/magenta background from imagegen
 * output, preserving anti-aliased edges via a soft alpha falloff.
 *
 * Algorithm:
 *   1. For each RGBA pixel, compute Euclidean distance in RGB space to the
 *      target keyColor.
 *   2. Inside the tolerance ball: alpha = 0 (fully removed).
 *   3. In the soft band (tolerance .. tolerance * 1.5): alpha falls off
 *      smoothly so anti-aliased edges retain a feathered halo.
 *   4. Outside the soft band: alpha = original (typically 255).
 *   5. Despill: in the soft band, subtract the key color's hue channel so
 *      green spill on rim-lit edges desaturates instead of glowing green.
 */

import sharp from 'sharp';

/**
 * @param {import('sharp').Sharp} input
 * @param {{ rgb: [number, number, number], tolerance: number }} keyConfig
 * @returns {Promise<import('sharp').Sharp>}
 */
export async function stripChromaKey(input, keyConfig) {
  const { data, info } = await input
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [kr, kg, kb] = keyConfig.rgb;
  const tol = keyConfig.tolerance;
  const softBand = tol * 1.5;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dr = r - kr;
    const dg = g - kg;
    const db = b - kb;
    const d = Math.sqrt(dr * dr + dg * dg + db * db);
    if (d <= tol) {
      data[i + 3] = 0;
    } else if (d <= softBand) {
      const t = (d - tol) / (softBand - tol);
      data[i + 3] = Math.round(data[i + 3] * t * t * (3 - 2 * t));
      // Despill: pull the key channel toward neutral (mean of other channels).
      const neutral = (r + b) / 2;
      data[i + 1] = Math.round(g + (neutral - g) * (1 - t));
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}
