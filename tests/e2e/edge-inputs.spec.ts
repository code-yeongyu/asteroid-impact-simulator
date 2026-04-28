import { test, expect } from '@playwright/test';

test.describe('Edge case input validation', () => {
  test.fixme(
    'd=0 surfaces a "diameter must be greater than 0" form error',
    async ({ page }) => {
      await page.goto('/en/simulator');
      const diameterInput = page.getByRole('spinbutton', { name: /diameter/i });
      await diameterInput.fill('0');
      await diameterInput.blur();
      await expect(page.getByRole('alert')).toContainText(/diameter|positive|greater/i);
    },
  );

  test.fixme(
    'v=10000 (below 11200 m/s escape velocity) surfaces a velocity error',
    async ({ page }) => {
      await page.goto('/en/simulator');
      const velocityInput = page.getByRole('spinbutton', { name: /velocity/i });
      await velocityInput.fill('10000');
      await velocityInput.blur();
      await expect(page.getByRole('alert')).toContainText(/escape|velocity|11/i);
    },
  );

  test.fixme(
    'angle=0 surfaces a grazing-impact warning but does not block submission',
    async ({ page }) => {
      await page.goto('/en/simulator');
      const angleInput = page.getByRole('spinbutton', { name: /angle/i });
      await angleInput.fill('0');
      await angleInput.blur();
      await expect(page.getByRole('status')).toContainText(/grazing|shallow|warning/i);
    },
  );
});
