import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';

const WCAG_22_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] as const;

export interface A11yScanOptions {
  readonly tags?: readonly string[];
  readonly exclude?: readonly string[];
  readonly attachFullResults?: boolean;
}

export async function runA11yScan(
  page: Page,
  testInfo: TestInfo,
  options: A11yScanOptions = {},
): Promise<void> {
  const tags = options.tags ?? WCAG_22_AA_TAGS;
  const builder = new AxeBuilder({ page }).withTags([...tags]);
  for (const selector of options.exclude ?? []) {
    builder.exclude(selector);
  }

  const results = await builder.analyze();

  if (options.attachFullResults !== false) {
    await testInfo.attach('axe-results.json', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
  }

  const summary = results.violations
    .map(
      (v) =>
        `- [${v.impact ?? 'unknown'}] ${v.id} (${v.nodes.length} node${
          v.nodes.length === 1 ? '' : 's'
        }): ${v.help} → ${v.helpUrl}`,
    )
    .join('\n');

  expect(
    results.violations,
    `axe-core found ${results.violations.length} violation(s) on "${testInfo.title}":\n${summary}`,
  ).toEqual([]);
}
