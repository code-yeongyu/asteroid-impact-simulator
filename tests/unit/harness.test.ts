import { describe, it, expect } from 'vitest';
import {
  GOLDEN_IMPACTS,
  GOLDEN_IMPACTS_COUNT,
  type GoldenImpactFixture,
} from '../golden-impacts.fixtures';

describe('test harness sanity', () => {
  it('extends expect with @testing-library/jest-dom matchers', () => {
    const div = document.createElement('div');
    div.textContent = 'hello';
    expect(div).toHaveTextContent('hello');
  });

  it('exposes exactly 4 golden impact fixtures', () => {
    expect(GOLDEN_IMPACTS_COUNT).toBe(4);
    expect(GOLDEN_IMPACTS).toHaveLength(4);
  });

  it('every golden fixture declares SI inputs and an energy expectation', () => {
    for (const fixture of GOLDEN_IMPACTS) {
      const f: GoldenImpactFixture = fixture;
      expect(f.inputs.diameter_m).toBeGreaterThan(0);
      expect(f.inputs.density_kgm3).toBeGreaterThan(0);
      expect(f.inputs.velocity_ms).toBeGreaterThan(0);
      expect(f.inputs.angle_deg).toBeGreaterThan(0);
      expect(f.inputs.angle_deg).toBeLessThan(90);
      expect(['kt', 'Mt', 'Tt']).toContain(f.expected.energy.unit);
      expect(f.expected.energy.min).toBeLessThan(f.expected.energy.max);
      expect(f.citation.length).toBeGreaterThan(20);
    }
  });

  it('preserves canonical reference order and slugs', () => {
    expect(GOLDEN_IMPACTS.map((g) => g.slug)).toEqual([
      'chelyabinsk-2013',
      'tunguska-1908',
      'barringer-crater',
      'chicxulub-kpg',
    ]);
  });
});
