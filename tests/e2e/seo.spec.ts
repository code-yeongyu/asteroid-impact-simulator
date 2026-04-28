import { test, expect } from '@playwright/test';

test.describe('SEO meta tags', () => {
  test('page has all 28 hreflang + x-default', async ({ page }) => {
    await page.goto('/en/simulator');
    const links = await page.locator('link[rel="alternate"][hreflang]').count();
    expect(links).toBeGreaterThanOrEqual(29);
    const xdefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').count();
    expect(xdefault).toBe(1);
  });

  test('page has canonical link', async ({ page, baseURL }) => {
    await page.goto('/en/simulator');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', `${baseURL ?? ''}/en/simulator`);
  });

  test('page has og:title and og:description', async ({ page }) => {
    await page.goto('/en/simulator');
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDesc = page.locator('meta[property="og:description"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
    await expect(ogDesc).toHaveAttribute('content', /.+/);
  });

  test('page has twitter:card', async ({ page }) => {
    await page.goto('/en/simulator');
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('page has JSON-LD script', async ({ page }) => {
    await page.goto('/en/simulator');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    const content = await jsonLd.textContent();
    expect(content).toBeTruthy();
    const parsed = JSON.parse(content ?? '{}') as Record<string, unknown>;
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toMatch(/WebApplication|TechArticle/);
  });

  test('methodology page has TechArticle schema with citations', async ({ page }) => {
    await page.goto('/en/methodology');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const content = await jsonLd.textContent();
    const parsed = JSON.parse(content ?? '{}') as Record<string, unknown>;
    expect(parsed['@type']).toBe('TechArticle');
    expect(Array.isArray(parsed.citation)).toBe(true);
    expect((parsed.citation as unknown[]).length).toBeGreaterThanOrEqual(3);
  });
});

test.describe('sitemap.xml', () => {
  test('sitemap has 140 URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    const count = (body.match(/<url>/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(140);
  });
});
