import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 2 } : {}),
  reporter: [
    ['list'],
    ['html', { outputFolder: '.sisyphus/evidence/playwright-report', open: 'never' }],
    ['json', { outputFile: '.sisyphus/evidence/playwright-results.json' }],
  ],
  outputDir: '.sisyphus/evidence/playwright-output',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /.*\.a11y\.spec\.ts$/,
      use: devices['Desktop Chrome'],
    },
    ...(isCI
      ? []
      : [
          {
            name: 'firefox',
            testIgnore: /.*\.a11y\.spec\.ts$/,
            use: devices['Desktop Firefox'],
          },
          {
            name: 'webkit',
            testIgnore: /.*\.a11y\.spec\.ts$/,
            use: devices['Desktop Safari'],
          },
          {
            name: 'mobile-chrome',
            testIgnore: /.*\.a11y\.spec\.ts$/,
            use: devices['iPhone 14 Pro'],
          },
          {
            name: 'tablet-safari',
            testIgnore: /.*\.a11y\.spec\.ts$/,
            use: devices['iPad Pro 11'],
          },
        ]),
    {
      name: 'a11y',
      testDir: './tests/a11y',
      testMatch: /.*\.a11y\.spec\.ts$/,
      use: devices['Desktop Chrome'],
    },
  ],
  webServer: {
    command: 'bun run preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
