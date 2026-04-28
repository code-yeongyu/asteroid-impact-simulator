import { describe, it, expect } from 'vitest';
import { PRERENDER_PATHS } from '../../react-router.config';

describe('routing config', () => {
  it('prerender returns 140 paths (28 locales × 5 pages)', () => {
    const paths = PRERENDER_PATHS;
    expect(paths).toHaveLength(140);
  });

  it('includes all locale roots', () => {
    const paths = PRERENDER_PATHS;
    expect(paths).toContain('/en');
    expect(paths).toContain('/ar');
    expect(paths).toContain('/ja');
    expect(paths).toContain('/de');
    expect(paths).toContain('/zh-CN');
  });

  it('includes all page variants', () => {
    const paths = PRERENDER_PATHS;
    expect(paths).toContain('/en/simulator');
    expect(paths).toContain('/en/methodology');
    expect(paths).toContain('/en/privacy');
    expect(paths).toContain('/en/this-does-not-exist-404-test');
  });
});
