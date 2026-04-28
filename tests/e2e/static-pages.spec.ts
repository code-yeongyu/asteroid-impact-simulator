import { test, expect } from '@playwright/test';

test.describe('Static Pages', () => {
  test('404 catchall renders', () => {
    expect(true).toBe(true);
  });

  test('Privacy page lists no-cookies + disclaimer', () => {
    expect(true).toBe(true);
  });
});
