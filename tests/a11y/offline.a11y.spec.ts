import { test } from '@playwright/test';
import { runA11yScan } from './runA11yScan';

test.describe('Offline page accessibility', () => {
  test('en offline page is WCAG 2.2 AA clean', async ({ page }, testInfo) => {
    await page.goto('/en/offline');
    await runA11yScan(page, testInfo);
  });
});
