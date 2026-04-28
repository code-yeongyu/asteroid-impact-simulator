import { test, expect } from '@playwright/test';

const RTL_LOCALES = ['ar', 'fa', 'he'];

test.describe('routing', () => {
  test('root / renders English default', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
    await expect(html).toHaveAttribute('dir', 'ltr');
  });

  test('locale pages have correct lang', async ({ page }) => {
    for (const locale of ['en', 'ko', 'ja', 'de']) {
      await page.goto(`/${locale}`);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', locale);
    }
  });

  test('RTL locales have dir=rtl', async ({ page }) => {
    for (const locale of RTL_LOCALES) {
      await page.goto(`/${locale}`);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
    }
  });

  test('LTR locales have dir=ltr', async ({ page }) => {
    for (const locale of ['en', 'de', 'ja']) {
      await page.goto(`/${locale}`);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'ltr');
    }
  });

  test('invalid locale shows 404', async ({ page }) => {
    await page.goto('/xx/this-does-not-exist');
    const heading = page.locator('h1');
    await expect(heading).toContainText(/not found|404/i);
  });

  test('simulator page exists for en', async ({ page }) => {
    await page.goto('/en/simulator');
    const heading = page.locator('h1');
    await expect(heading).toContainText('Simulator');
  });
});
