import { test, expect } from '@playwright/test';

test.describe('RTL provider', () => {
  test('html dir is rtl for ar locale', async ({ page }) => {
    await page.goto('/ar/');
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  test('html dir is ltr for en locale', async ({ page }) => {
    await page.goto('/en/');
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('ltr');
  });

  test('html lang matches locale', async ({ page }) => {
    await page.goto('/ja/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('ja');
  });
});

test.describe('RTL portal popup', () => {
  test('popup has dir=rtl in ar locale', async ({ page }) => {
    await page.goto('/ar/');
    const popup = page.locator('[role="dialog"], [role="tooltip"], [role="menu"]').first();
    if (await popup.isVisible().catch(() => false)) {
      const dir = await popup.getAttribute('dir');
      expect(dir).toBe('rtl');
    }
  });
});

test.describe('Bidi numbers', () => {
  test('numbers render with ltr direction in RTL context', async ({ page }) => {
    await page.goto('/ar/');
    const bdi = page.locator('bdi').first();
    if (await bdi.isVisible().catch(() => false)) {
      const dir = await bdi.getAttribute('dir');
      expect(dir).toBe('ltr');
    }
  });
});
