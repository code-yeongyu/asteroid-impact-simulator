import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

test.describe('RTL provider', () => {
  test('html dir is rtl for ar locale', async ({ page }) => {
    await page.goto(`${BASE_URL}/ar`);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('html dir is ltr for en locale', async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('ltr');
  });

  test('html lang matches locale', async ({ page }) => {
    await page.goto(`${BASE_URL}/ja`);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('ja');
  });
});

test.describe('RTL portal popup', () => {
  test('popup has dir=rtl in ar locale', async ({ page }) => {
    await page.goto(`${BASE_URL}/ar`);
    const popup = page.locator('[role="dialog"], [role="tooltip"], [role="menu"]').first();
    if (await popup.isVisible().catch(() => false)) {
      const dir = await popup.getAttribute('dir');
      expect(dir).toBe('rtl');
    }
  });
});

test.describe('Bidi numbers', () => {
  test('numbers render with ltr direction in RTL context', async ({ page }) => {
    await page.goto(`${BASE_URL}/ar`);
    const bdi = page.locator('bdi').first();
    if (await bdi.isVisible().catch(() => false)) {
      const dir = await bdi.getAttribute('dir');
      expect(dir).toBe('ltr');
    }
  });
});
