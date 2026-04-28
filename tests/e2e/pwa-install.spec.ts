import { test, expect } from '@playwright/test';

const REQUIRED_MANIFEST_KEYS = [
  'name',
  'short_name',
  'description',
  'start_url',
  'display',
  'theme_color',
  'background_color',
  'icons',
] as const;

test.describe('PWA manifest', () => {
  test('manifest.webmanifest is reachable and well-formed JSON', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    for (const key of REQUIRED_MANIFEST_KEYS) {
      expect(json, `manifest is missing required key "${key}"`).toHaveProperty(key);
    }
  });

  test('manifest declares at least one 192px and one 512px PNG icon', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    const json = (await res.json()) as { icons: Array<{ src: string; sizes: string; type: string }> };
    const has192 = json.icons.some((i) => i.sizes === '192x192' && i.type === 'image/png');
    const has512 = json.icons.some((i) => i.sizes === '512x512' && i.type === 'image/png');
    expect(has192, 'manifest needs a 192x192 PNG icon').toBe(true);
    expect(has512, 'manifest needs a 512x512 PNG icon').toBe(true);
  });

  test('manifest includes a maskable icon for adaptive home-screen', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    const json = (await res.json()) as { icons: Array<{ purpose?: string }> };
    const hasMaskable = json.icons.some((i) => (i.purpose ?? '').split(/\s+/).includes('maskable'));
    expect(hasMaskable, 'manifest needs at least one maskable icon').toBe(true);
  });
});

test.describe('PWA HTML hints', () => {
  test('landing page links to a webmanifest', async ({ page }) => {
    await page.goto('/en');
    const link = page.locator('link[rel="manifest"]').first();
    await expect(link).toHaveAttribute('href', /\.webmanifest$/);
  });

  test('landing page declares a theme-color meta tag', async ({ page }) => {
    await page.goto('/en');
    const themeColor = page.locator('meta[name="theme-color"]').first();
    await expect(themeColor).toHaveAttribute('content', /^#[0-9a-f]{3,8}$/i);
  });
});

test.describe('PWA install prompt', () => {
  test.fixme(
    'beforeinstallprompt fires when criteria are met',
    async ({ page }) => {
      const installEvents: string[] = [];
      await page.addInitScript(() => {
        window.addEventListener('beforeinstallprompt', () => {
          (window as unknown as { __installEvents: string[] }).__installEvents = [
            ...((window as unknown as { __installEvents?: string[] }).__installEvents ?? []),
            'beforeinstallprompt',
          ];
        });
      });
      await page.goto('/en');
      await page.waitForLoadState('networkidle');
      const fired = await page.evaluate(
        () => (window as unknown as { __installEvents?: string[] }).__installEvents ?? [],
      );
      installEvents.push(...fired);
      expect(installEvents).toContain('beforeinstallprompt');
    },
  );
});
