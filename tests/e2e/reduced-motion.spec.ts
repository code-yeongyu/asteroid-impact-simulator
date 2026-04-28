import { test, expect } from '@playwright/test';

test.describe('Reduced-motion honors user preference', () => {
  test.use({ colorScheme: 'dark' });

  test('animation-duration collapses to ~0ms across all elements when prefers-reduced-motion: reduce', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');

    const probeName = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.id = 'rm-probe';
      probe.style.transition = 'opacity 800ms ease';
      probe.style.animation = 'spin 2s linear infinite';
      document.body.appendChild(probe);
      const cs = window.getComputedStyle(probe);
      return { animationDuration: cs.animationDuration, transitionDuration: cs.transitionDuration };
    });

    expect(parseDurationMs(probeName.animationDuration)).toBeLessThanOrEqual(1);
    expect(parseDurationMs(probeName.transitionDuration)).toBeLessThanOrEqual(1);
  });

  test('reduced-motion does not break page render or throw', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/methodology');
    await expect(page.locator('h1')).toBeVisible();
    expect(errors, `Expected no errors, got:\n${errors.join('\n')}`).toHaveLength(0);
  });
});

function parseDurationMs(value: string): number {
  const parts = value.split(',').map((v) => v.trim());
  const ms = parts.map((part) => {
    if (part.endsWith('ms')) return Number.parseFloat(part.slice(0, -2));
    if (part.endsWith('s')) return Number.parseFloat(part.slice(0, -1)) * 1000;
    return Number.NaN;
  });
  return Math.max(...ms);
}
