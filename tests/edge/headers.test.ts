import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('Cloudflare static asset headers', () => {
  it('sets immutable caching for built assets', () => {
    // given
    const headers = readFileSync('public/_headers', 'utf8');

    // when
    const assetRule = headers.slice(headers.indexOf('/assets/*'), headers.indexOf('/fonts/*'));

    // then
    expect(assetRule).toContain('Cache-Control: public, max-age=31536000, immutable');
    expect(assetRule).toContain('X-Content-Type-Options: nosniff');
  });

  it('sets locked security headers without removal patterns', () => {
    // given
    const headers = readFileSync('public/_headers', 'utf8');

    // when
    const globalRule = headers.slice(headers.indexOf('/*'));

    // then
    expect(globalRule).toContain('X-Frame-Options: DENY');
    expect(globalRule).toContain('Content-Security-Policy: default-src');
    expect(globalRule).toContain("frame-ancestors 'none'");
    expect(headers).not.toContain('\n!');
  });
});
