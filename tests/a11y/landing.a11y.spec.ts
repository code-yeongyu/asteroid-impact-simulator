import { test } from '@playwright/test';
import { runA11yScan } from './runA11yScan';

test.describe('Landing page accessibility', () => {
  test('en landing page is WCAG 2.2 AA clean', async ({ page }, testInfo) => {
    await page.goto('/en');
    await runA11yScan(page, testInfo);
  });

  test('ar landing page is WCAG 2.2 AA clean (RTL)', async ({ page }, testInfo) => {
    await page.goto('/ar');
    await runA11yScan(page, testInfo);
  });

  test('ja landing page is WCAG 2.2 AA clean (CJK)', async ({ page }, testInfo) => {
    await page.goto('/ja');
    await runA11yScan(page, testInfo);
  });
});
