import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const envFile = path.join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

// Every worker loads this file again, so the run ID is made once, in the main process, and the
// workers inherit it through the environment. The time first makes run folders sort by age.
process.env.TEST_RUN_ID ??= `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
const historyDir = path.join(__dirname, 'playwright-history');
// Each run's report title says what was tested, with the variables as they're set.
const reportTitle = [
  process.env.TEST_APP_FOLDER || 'folder not set',
  process.env.TEST_BROWSER || 'browser not set',
  process.env.TEST_APP_URL || 'URL not set',
].join(' - ');

export default defineConfig({
  testDir: process.env.TEST_APP_FOLDER,
  // Shared by every run, not one per run: each run's HTML report keeps its own copy of every trace and
  // screenshot. Two runs at the same time in this folder clear each other's test-results.
  outputDir: 'test-results',
  fullyParallel: process.env.TEST_PARALLEL === "true",
  retries: Number(process.env.TEST_RETRIES || 0),
  workers: Number(process.env.TEST_WORKERS) || undefined,
  forbidOnly: !!process.env.CI,
  // Locally, each run's report goes into playwright-history. Listing tests (--list) doesn't run them,
  // so it only prints the list.
  reporter:
    process.env.GITLAB_CI === 'true'
      ? 'html'
      : process.argv.includes('--list')
        ? 'list'
        : [
            [
              'html',
              {
                outputFolder: path.join(historyDir, process.env.TEST_RUN_ID, 'html'),
                open: 'on-failure',
                title: reportTitle,
              },
            ],
            [
              './reporters/run-history-reporter.ts',
              {
                historyDir,
                runId: process.env.TEST_RUN_ID,
                keep: Number(process.env.TEST_HISTORY_KEEP) || 20,
                appFolder: process.env.TEST_APP_FOLDER,
                appUrl: process.env.TEST_APP_URL,
                browser: process.env.TEST_BROWSER,
              },
            ],
          ],
  use: {
    baseURL: process.env.TEST_APP_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'msedge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ].filter((project) => project.name === process.env.TEST_BROWSER),

});
