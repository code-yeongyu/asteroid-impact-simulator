import { test, expect } from '@playwright/test';

test.describe('Antimeridian rendering (lng=180)', () => {
  test.fixme(
    'damage circle at lat=0,lng=180 renders without splitting or page overflow',
    async ({ page }) => {
      await page.goto('/en/simulator?lat=0&lng=180&d=100&v=20000&a=45&dens=3000');
      await page.waitForLoadState('networkidle');

      const map = page.locator('[data-testid="impact-map"]');
      await expect(map).toBeVisible();

      const damageCircle = page.locator('[data-testid="damage-circle"]');
      await expect(damageCircle.first()).toBeVisible();

      const result = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
    },
  );
});
