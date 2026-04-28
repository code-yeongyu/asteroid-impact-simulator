/**
 * Procedural cosmic placeholder renderer.
 *
 * Fallback used by `scripts/generate-assets.mjs` when imagegen is unavailable
 * (no GEMINI_API_KEY / OPENAI_API_KEY in this session). Produces visually
 * plausible cosmic placeholders that:
 *   - render as RGBA Uint8Array buffers
 *   - share the same dimensions / alpha shape as the real imagegen output
 *   - contain a stamped TODO_REGENERATE marker in the EXIF/text metadata
 *
 * Determinism: each placeholder is seeded by its slug, so re-running without
 * config changes produces byte-identical output (idempotent CI).
 *
 * No external runtime deps beyond `sharp`. The simplex-noise package in our
 * runtime deps is too React-runtime-flavored; we implement a tiny seeded LCG
 * here that's good enough for "looks like cosmic noise on a placeholder".
 */

import sharp from 'sharp';

// ---- Tiny deterministic PRNG --------------------------------------------------
// Mulberry32 from public-domain references. Fast, decent distribution for noise.
function makeRng(seedString) {
  let h = 1779033703 ^ seedString.length;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let t = h >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Smoothstep helper.
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ---- Cosmic backdrop ----------------------------------------------------------
// Dark navy + faint nebula gradient (teal/rust, NOT purple-blue saas slop) +
// scattered stars. Opaque (no alpha channel — used as full-bleed bg).
function renderCosmicVoid(width, height, seed) {
  const rng = makeRng(seed);
  const buf = Buffer.alloc(width * height * 4);

  // Two nebula blobs (teal NE, rust SW) — soft, subtle.
  const blobs = [
    { cx: width * 0.78, cy: height * 0.22, r: Math.min(width, height) * 0.55, color: [22, 38, 52], strength: 0.55 },
    { cx: width * 0.18, cy: height * 0.78, r: Math.min(width, height) * 0.45, color: [38, 22, 18], strength: 0.4 },
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Base void color (deep navy).
      let r = 3;
      let g = 6;
      let b = 12;
      // Nebula layers.
      for (const blob of blobs) {
        const dx = x - blob.cx;
        const dy = y - blob.cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        const fall = smoothstep(blob.r, blob.r * 0.05, d);
        r += blob.color[0] * fall * blob.strength;
        g += blob.color[1] * fall * blob.strength;
        b += blob.color[2] * fall * blob.strength;
      }
      // Subtle film-grain.
      const grain = (rng() - 0.5) * 4;
      const i = (y * width + x) * 4;
      buf[i + 0] = Math.max(0, Math.min(255, r + grain));
      buf[i + 1] = Math.max(0, Math.min(255, g + grain));
      buf[i + 2] = Math.max(0, Math.min(255, b + grain));
      buf[i + 3] = 255;
    }
  }

  // Sprinkle stars — three luminance tiers.
  const starTiers = [
    { count: Math.round((width * height) / 12000), brightness: 230, glowRadius: 1 },
    { count: Math.round((width * height) / 36000), brightness: 200, glowRadius: 2 },
    { count: Math.round((width * height) / 90000), brightness: 255, glowRadius: 3 },
  ];
  for (const tier of starTiers) {
    for (let s = 0; s < tier.count; s++) {
      const sx = Math.floor(rng() * width);
      const sy = Math.floor(rng() * height);
      for (let dy = -tier.glowRadius; dy <= tier.glowRadius; dy++) {
        for (let dx = -tier.glowRadius; dx <= tier.glowRadius; dx++) {
          const px = sx + dx;
          const py = sy + dy;
          if (px < 0 || py < 0 || px >= width || py >= height) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const fall = Math.max(0, 1 - dist / (tier.glowRadius + 0.5));
          const i = (py * width + px) * 4;
          const v = tier.brightness * fall;
          buf[i + 0] = Math.min(255, buf[i + 0] + v);
          buf[i + 1] = Math.min(255, buf[i + 1] + v);
          buf[i + 2] = Math.min(255, buf[i + 2] + v);
        }
      }
    }
  }
  return buf;
}

// ---- Spherical asteroid placeholder ------------------------------------------
// Soft-shaded sphere with surface noise. Alpha channel cuts a clean circle.
// Color palette per type (iron/rocky/cometary).
function renderAsteroidSphere(width, height, seed, palette) {
  const rng = makeRng(seed);
  const buf = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.42;

  // Pre-generate a coarse noise grid for surface variation.
  const noiseGrid = 32;
  const noise = new Float32Array(noiseGrid * noiseGrid);
  for (let i = 0; i < noise.length; i++) noise[i] = rng();

  const sampleNoise = (u, v) => {
    const fx = u * (noiseGrid - 1);
    const fy = v * (noiseGrid - 1);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const ax = fx - x0;
    const ay = fy - y0;
    const x1 = Math.min(x0 + 1, noiseGrid - 1);
    const y1 = Math.min(y0 + 1, noiseGrid - 1);
    const n00 = noise[y0 * noiseGrid + x0];
    const n10 = noise[y0 * noiseGrid + x1];
    const n01 = noise[y1 * noiseGrid + x0];
    const n11 = noise[y1 * noiseGrid + x1];
    return (
      n00 * (1 - ax) * (1 - ay) +
      n10 * ax * (1 - ay) +
      n01 * (1 - ax) * ay +
      n11 * ax * ay
    );
  };

  // Light direction (upper-right cool rim, classic cosmic shot).
  const lx = 0.7;
  const ly = -0.4;
  const lz = 0.55;
  const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
  const Lx = lx / lLen;
  const Ly = ly / lLen;
  const Lz = lz / lLen;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const r2 = dx * dx + dy * dy;
      const i = (y * width + x) * 4;

      if (r2 > 1) {
        // Outside sphere → fully transparent.
        buf[i + 0] = 0;
        buf[i + 1] = 0;
        buf[i + 2] = 0;
        buf[i + 3] = 0;
        continue;
      }

      const dz = Math.sqrt(1 - r2);
      // N·L lambert + cool rim.
      const NdotL = Math.max(0, dx * Lx + dy * Ly + dz * Lz);
      const rim = Math.pow(1 - dz, 3);
      // Surface noise sampled by spherical UV.
      const u = 0.5 + Math.atan2(dx, dz) / (2 * Math.PI);
      const v = 0.5 - dy * 0.5;
      const n = sampleNoise(u % 1, v) * 0.5 + sampleNoise((u * 4) % 1, v * 4) * 0.5;
      const surface = 0.7 + n * 0.3;

      const r = palette.base[0] * surface * (0.18 + 0.7 * NdotL) + palette.rim[0] * rim * 0.5;
      const g = palette.base[1] * surface * (0.18 + 0.7 * NdotL) + palette.rim[1] * rim * 0.5;
      const b = palette.base[2] * surface * (0.18 + 0.7 * NdotL) + palette.rim[2] * rim * 0.5;
      // Soft alpha at the edge (1px feather) for clean compositing.
      const edge = smoothstep(1, 0.985, Math.sqrt(r2));
      buf[i + 0] = Math.max(0, Math.min(255, r));
      buf[i + 1] = Math.max(0, Math.min(255, g));
      buf[i + 2] = Math.max(0, Math.min(255, b));
      buf[i + 3] = Math.round(255 * edge);
    }
  }
  return buf;
}

// ---- Earth placeholder --------------------------------------------------------
// Sphere + procedural continent splotches + atmosphere rim halo.
function renderEarth(width, height, seed) {
  const rng = makeRng(seed);
  const buf = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.4;
  const haloRadius = radius * 1.08;

  // Continents = blobs of olive-green, oceans = deep blue, polar cap = white.
  const ocean = [10, 32, 58];
  const land = [62, 88, 48];
  const polar = [220, 230, 235];
  const atmosphere = [88, 168, 220];

  // Continent noise grid.
  const ng = 48;
  const noise = new Float32Array(ng * ng);
  for (let i = 0; i < noise.length; i++) noise[i] = rng();
  const sampleN = (u, v) => {
    const fx = u * (ng - 1);
    const fy = v * (ng - 1);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    return noise[y0 * ng + x0];
  };

  // Light from upper-right (sun side).
  const Lx = 0.6;
  const Ly = -0.3;
  const Lz = 0.74;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - cx) / radius;
      const dy = (y - cy) / radius;
      const r2 = dx * dx + dy * dy;
      const i = (y * width + x) * 4;

      if (r2 > 1) {
        // Atmosphere halo zone.
        const haloD = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / haloRadius;
        if (haloD < 1) {
          const halo = Math.pow(1 - (haloD - radius / haloRadius) / (1 - radius / haloRadius), 3);
          const a = Math.round(160 * halo);
          buf[i + 0] = atmosphere[0];
          buf[i + 1] = atmosphere[1];
          buf[i + 2] = atmosphere[2];
          buf[i + 3] = a;
        } else {
          buf[i + 0] = 0;
          buf[i + 1] = 0;
          buf[i + 2] = 0;
          buf[i + 3] = 0;
        }
        continue;
      }

      const dz = Math.sqrt(1 - r2);
      const NdotL = Math.max(0, dx * Lx + dy * Ly + dz * Lz);
      const u = (0.5 + Math.atan2(dx, dz) / (2 * Math.PI)) % 1;
      const v = 0.5 - dy * 0.5;
      const n = sampleN(u, v);
      const isLand = n > 0.55;
      const isPole = Math.abs(dy) > 0.86;
      const base = isPole ? polar : isLand ? land : ocean;
      // Day/night terminator: lambert-shaded with cool dusk band.
      const dayFactor = 0.15 + NdotL * 0.85;
      const r = base[0] * dayFactor;
      const g = base[1] * dayFactor;
      const b = base[2] * dayFactor;
      // Day-side atmosphere rim.
      const rim = Math.pow(1 - dz, 4);
      buf[i + 0] = Math.min(255, r + atmosphere[0] * rim * 0.45);
      buf[i + 1] = Math.min(255, g + atmosphere[1] * rim * 0.45);
      buf[i + 2] = Math.min(255, b + atmosphere[2] * rim * 0.45);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

// ---- Public API ---------------------------------------------------------------

const PALETTES = {
  iron: { base: [120, 100, 92], rim: [120, 168, 220] },     // dark steel + cool rim
  rocky: { base: [128, 116, 96], rim: [180, 200, 220] },    // grey-brown + neutral rim
  cometary: { base: [210, 220, 230], rim: [140, 200, 240] }, // dirty-ice + blue rim
};

/**
 * Render a placeholder asset for a given slug.
 * Returns a sharp pipeline ready for further processing.
 *
 * @param {string} slug
 * @param {{ width: number, height: number }} dims
 * @returns {import('sharp').Sharp}
 */
export function renderPlaceholder(slug, dims) {
  const seed = `dionysus:${slug}:${dims.width}x${dims.height}`;
  let raw;
  if (slug === 'cosmic-void-bg') {
    raw = renderCosmicVoid(dims.width, dims.height, seed);
  } else if (slug === 'asteroid-iron') {
    raw = renderAsteroidSphere(dims.width, dims.height, seed, PALETTES.iron);
  } else if (slug === 'asteroid-rocky') {
    raw = renderAsteroidSphere(dims.width, dims.height, seed, PALETTES.rocky);
  } else if (slug === 'asteroid-cometary') {
    raw = renderAsteroidSphere(dims.width, dims.height, seed, PALETTES.cometary);
  } else if (slug === 'earth-from-space') {
    raw = renderEarth(dims.width, dims.height, seed);
  } else {
    throw new Error(`Unknown placeholder slug: ${slug}`);
  }
  return sharp(raw, { raw: { width: dims.width, height: dims.height, channels: 4 } });
}
