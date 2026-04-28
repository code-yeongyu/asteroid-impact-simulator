import { test } from '@playwright/test';
import { runA11yScan } from './runA11yScan';

test.describe('Methodology page accessibility', () => {
  test('en methodology is WCAG 2.2 AA clean', async ({ page }, testInfo) => {
    await page.goto('/en/methodology');
    await runA11yScan(page, testInfo);
  });

  test('ar methodology is WCAG 2.2 AA clean (RTL)', async ({ page }, testInfo) => {
    await page.goto('/ar/methodology');
    await runA11yScan(page, testInfo);
  });
});
