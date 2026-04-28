import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

test.describe('Methodology page', () => {
  test('page loads with title and description', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/methodology`);
    await expect(page.locator('h1')).toContainText('Methodology');
    await expect(page.locator('text=How the simulator works')).toBeVisible();
  });

  test('has at least 6 KaTeX-rendered formulas', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/methodology`);
    const katexElements = page.locator('.katex');
    await expect(katexElements.first()).toBeVisible({ timeout: 5000 });
    const count = await katexElements.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('table of contents is visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/methodology`);
    await expect(page.locator('nav[aria-label="Table of contents"]')).toBeVisible();
  });

  test('limitations section lists guardrails', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/methodology`);
    const limits = await page.locator('[data-testid="limitations-section"]').textContent();
    expect(limits).toMatch(/tsunami/i);
    expect(limits).toMatch(/casualt|fatalit/i);
    expect(limits).toMatch(/ozone|atmosph/i);
  });

  test('citations have DOI links', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/methodology`);
    const doiLinks = page.locator('a[href^="https://doi.org/"]');
    const count = await doiLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('heading hierarchy is sequential', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/methodology`);
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);
    const h2s = await page.locator('h2').count();
    expect(h2s).toBeGreaterThanOrEqual(5);
  });
});
