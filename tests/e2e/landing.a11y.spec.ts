import { test } from '@playwright/test';
import { runA11yScan } from '../a11y/runA11yScan';

test.describe('@a11y placeholder axe scan', () => {
  test.skip('landing page is WCAG 2.2 AA clean', async ({ page }, testInfo) => {
    await page.goto('/');
    await runA11yScan(page, testInfo);
  });
});
