import { test, expect } from '@playwright/test';

test.describe('Offline route', () => {
  test('renders the offline fallback page directly', async ({ page }) => {
    await page.goto('/en/offline');
    await expect(page.locator('h1')).toContainText('Offline');
    await expect(page.locator('text=/offline|connection/i').first()).toBeVisible();
  });

  test('offline page has no JS errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/en/offline');
    expect(errors, `Expected no page errors, got:\n${errors.join('\n')}`).toHaveLength(0);
  });
});

test.describe('Offline cache (service worker)', () => {
  test.fixme(
    'cached page renders when network is offline',
    async ({ page, context }) => {
      await page.goto('/en');
      await page.waitForLoadState('networkidle');

      await context.setOffline(true);
      await page.reload({ waitUntil: 'load' });
      await expect(page.locator('h1')).toBeVisible();

      await context.setOffline(false);
    },
  );
});
