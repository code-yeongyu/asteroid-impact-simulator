import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function snapshotFullPage(page: Page, name: string): Promise<void> {
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.01,
  });
}

export async function snapshotLocator(locator: Locator, name: string): Promise<void> {
  await expect(locator).toHaveScreenshot(name, {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.01,
  });
}
