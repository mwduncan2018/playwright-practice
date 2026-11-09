import { defineConfig, devices, type Project } from '@playwright/test';

import { settings } from './shared/settings';

// Everything here that changes between runs comes from shared/settings.ts, which reads the TEST_*
// variables. README.md lists them all.

const BROWSER_SETTINGS: Record<string, Project['use']> = {
  chromium: { ...devices['Desktop Chrome'] },
  firefox: { ...devices['Desktop Firefox'] },
  webkit: { ...devices['Desktop Safari'] },
  // Branded browsers use the Chrome or Edge installed on the machine (or in the image).
  chrome: { ...devices['Desktop Chrome'], channel: 'chrome' },
  msedge: { ...devices['Desktop Edge'], channel: 'msedge' },
};

export default defineConfig({
  testDir: `apps/${settings.app}/tests`,
  // Every test runs in parallel with every other, in its own browser context.
  fullyParallel: true,
  workers: 2,
  retries: settings.retries,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: './shared/global-setup.ts',
  outputDir: 'reports/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: settings.appUrl,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: settings.browsers.map((name) => ({ name, use: BROWSER_SETTINGS[name] })),
});
