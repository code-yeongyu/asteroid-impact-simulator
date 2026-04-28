import { test, expect } from '@playwright/test';

test.describe('Long-string fuzz (de locale, longest words)', () => {
  test('de landing renders without page-level horizontal overflow at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    const result = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1);
  });

  test.fixme(
    'no button/badge in de simulator UI clips its label at any viewport',
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/de/simulator');
      const buttons = page.getByRole('button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box === null) continue;
        const overflow = await button.evaluate((el) => {
          const node = el as HTMLElement;
          return node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight;
        });
        expect(overflow, `button #${i} clips its label at 375px`).toBe(false);
      }
    },
  );
});
