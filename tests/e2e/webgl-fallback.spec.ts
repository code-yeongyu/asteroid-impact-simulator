import { test, expect } from '@playwright/test';

test.describe('WebGL fallback', () => {
  test.fixme(
    'asteroid 3D viewer renders static fallback when WebGL is disabled',
    async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.addInitScript(() => {
        const proto = HTMLCanvasElement.prototype;
        const original = proto.getContext.bind(proto);
        proto.getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) {
          if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
            return null;
          }
          return original.call(this, type, ...(rest as [unknown]));
        } as typeof proto.getContext;
      });
      await page.goto('/en/simulator');

      const canvas = page.locator('canvas');
      await expect(canvas).toHaveCount(0);

      const fallback = page.locator('[data-testid="asteroid-fallback"]');
      await expect(fallback).toBeVisible();
      await expect(fallback).toHaveAttribute('role', 'img');

      await context.close();
    },
  );
});
