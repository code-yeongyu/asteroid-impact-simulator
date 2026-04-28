import { test, expect } from '@playwright/test';

test.describe('Golden simulator flow (Tunguska preset)', () => {
  test.fixme(
    'select Tunguska preset → results render → adjust slider → recompute → save → reload → persisted',
    async ({ page }) => {
      await page.goto('/en/simulator');

      const tunguskaPreset = page.getByRole('button', { name: /tunguska/i });
      await tunguskaPreset.click();

      const results = page.locator('[data-testid="results-panel"]');
      await expect(results).toBeVisible();
      const initialEnergy = await results.locator('[data-testid="energy-value"]').textContent();
      expect(initialEnergy).toMatch(/\d/);

      const diameterSlider = page.getByRole('slider', { name: /diameter/i });
      await diameterSlider.focus();
      await page.keyboard.press('ArrowRight');
      const updatedEnergy = await results.locator('[data-testid="energy-value"]').textContent();
      expect(updatedEnergy).not.toEqual(initialEnergy);

      await page.getByRole('button', { name: /save scenario/i }).click();

      await page.reload();
      await expect(results).toBeVisible();
      const restoredEnergy = await results.locator('[data-testid="energy-value"]').textContent();
      expect(restoredEnergy).toEqual(updatedEnergy);
    },
  );
});
