import { defineConfig, devices, type Project, type ReporterDescription } from '@playwright/test';

import { APPS } from './shared/apps';
import { type BrowserName, settings } from './shared/settings';

// Everything here that changes between runs comes from shared/settings.ts, which reads the TEST_*
// variables. README.md lists them all.

const BROWSER_SETTINGS: Record<BrowserName, Project['use']> = {
  chromium: { ...devices['Desktop Chrome'] },
  firefox: { ...devices['Desktop Firefox'] },
  webkit: { ...devices['Desktop Safari'] },
  // Branded browsers use the Chrome or Edge installed on the machine (or in the image).
  chrome: { ...devices['Desktop Chrome'], channel: 'chrome' },
  msedge: { ...devices['Desktop Edge'], channel: 'msedge' },
};

/** TEST_GREP and the environment's smoke-only rule together: a test must match both. */
function grep(): RegExp | undefined {
  const parts = [settings.smokeOnly ? '@smoke' : undefined, settings.grep].filter(Boolean);
  return parts.length > 0 ? new RegExp(parts.map((part) => `(?=.*(?:${part}))`).join('')) : undefined;
}

// A sharded run writes a blob report for merging later (npm run merge-reports); otherwise the
// HTML and JUnit reports are written straight away.
const reporters: ReporterDescription[] = settings.shard
  ? [
      ['list'],
      [
        'blob',
        { outputDir: 'reports/blob', fileName: `shard-${settings.shard.current}-of-${settings.shard.total}.zip` },
      ],
    ]
  : [
      ['list'],
      ['html', { outputFolder: 'reports/html', open: 'never' }],
      ['junit', { outputFile: 'reports/junit.xml' }],
    ];

export default defineConfig({
  testDir: APPS[settings.app].testDir,
  // Every test runs in parallel with every other, in its own browser context.
  fullyParallel: true,
  workers: settings.workers,
  shard: settings.shard,
  grep: grep(),
  grepInvert: settings.grepInvert ? new RegExp(settings.grepInvert) : undefined,
  retries: settings.retries,
  forbidOnly: settings.ci,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: './shared/global-setup.ts',
  outputDir: 'reports/artifacts',
  reporter: reporters,
  use: {
    baseURL: settings.appUrl,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: settings.browsers.map((name) => ({ name, use: BROWSER_SETTINGS[name] })),
});
