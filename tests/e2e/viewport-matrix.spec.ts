import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
] as const;

const ROUTES = ['/en', '/en/simulator', '/en/methodology', '/en/privacy', '/en/offline'] as const;

const LOCALES = ['en', 'ar', 'ja'] as const;

async function expectNoHorizontalOverflow(page: Page, route: string, width: number): Promise<void> {
  const result = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(
    result.scrollWidth,
    `route "${route}" at width ${width} overflows: scrollWidth=${result.scrollWidth} > clientWidth=${result.clientWidth}`,
  ).toBeLessThanOrEqual(result.clientWidth + 1);
}

for (const vp of VIEWPORTS) {
  test.describe(`No horizontal overflow at ${vp.width}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`${route}`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await expectNoHorizontalOverflow(page, route, vp.width);
      });
    }
  });
}

test.describe('No overflow across representative locales (375px viewport)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const locale of LOCALES) {
    test(`/${locale} landing fits viewport`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');
      await expectNoHorizontalOverflow(page, `/${locale}`, 375);
    });
  }
});
