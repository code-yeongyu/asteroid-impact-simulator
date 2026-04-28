import { test } from '@playwright/test';
import { runA11yScan } from './runA11yScan';

test.describe('Privacy page accessibility', () => {
  test('en privacy page is WCAG 2.2 AA clean', async ({ page }, testInfo) => {
    await page.goto('/en/privacy');
    await runA11yScan(page, testInfo);
  });
});
