import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { defineConfig, devices, type Project, type TraceMode } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const envFile = path.join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

// Every worker loads this file again, so the run ID is made once, in the main process, and the
// workers inherit it through the environment. The time first makes run folders sort by age.
process.env.TEST_RUN_ID ??= `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;

// When a test fails, Playwright saves a text copy of the page in its error context (error-context.md
// and the report's Error Context). The copy shows what's in each field, passwords included, so it's
// turned off for every test. Failures still get a screenshot, where password fields show as dots.
// Playwright doesn't document this variable, so check it still works after upgrading: see the README.
process.env.PLAYWRIGHT_NO_COPY_PROMPT = '1';

const historyDir = path.join(__dirname, 'playwright-history');
// Each run's report title says what was tested, with the variables as they're set.
const reportTitle = [
  process.env.TEST_APP_FOLDER || 'folder not set',
  process.env.TEST_BROWSER || 'browser not set',
  process.env.TEST_APP_URL || 'URL not set',
].join(' - ');

const BROWSERS: Record<string, Project['use']> = {
  chromium: { ...devices['Desktop Chrome'] },
  firefox: { ...devices['Desktop Firefox'] },
  webkit: { ...devices['Desktop Safari'] },
  msedge: { ...devices['Desktop Edge'], channel: 'msedge' },
  chrome: { ...devices['Desktop Chrome'], channel: 'chrome' },
};
const browserName = process.env.TEST_BROWSER ?? '';
const browser = BROWSERS[browserName];

// bddgen turns each of the app's Gherkin features into a spec file beside it, such as
// features/dashboard.feature.spec.js. playwright-bdd needs its output folder to be the projects' test
// folder, so it's the app's folder, and features and spec files run in the same projects. Before
// writing, bddgen deletes every .spec.js file in that folder, so hand-written specs stay .spec.ts.
// Run bddgen before playwright test: npm test does both.
const appFolder = process.env.TEST_APP_FOLDER;
if (appFolder) {
  defineBddConfig({
    featuresRoot: path.join(__dirname, appFolder),
    features: `${appFolder}/features/*.feature`,
    steps: [`${appFolder}/steps/*.steps.ts`, `${appFolder}/fixtures.ts`],
    outputDir: appFolder,
  });
}

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
    trace: (process.env.TEST_TRACE || 'on-first-retry') as TraceMode,
    // A failing test gets a screenshot of each page it has open, one per user.
    screenshot: 'only-on-failure',
  },

  // All four run in the browser TEST_BROWSER names. Without a known browser there are no projects,
  // so Playwright says "No tests found".
  projects: browser
    ? [
        // Signs in every account once and saves the sessions the tests start from.
        { name: 'setup', testDir: './shared', testMatch: /auth\.setup\.ts/, use: browser },
        // The tests on shared accounts: fully parallel when TEST_PARALLEL is true.
        { name: browserName, use: browser, dependencies: ['setup'], grepInvert: [/@side-account/, /@no-trace/] },
        // The tests on side accounts change the user's own data, so they run one at a time.
        { name: 'side-accounts', use: browser, dependencies: ['setup'], grep: /@side-account/, workers: 1 },
        // A trace records what's typed, passwords included. A Gherkin scenario can't turn its trace
        // off the way a spec file can, so a scenario that types a password is tagged @no-trace and runs here.
        { name: 'no-trace', use: { ...browser, trace: 'off' }, dependencies: ['setup'], grep: /@no-trace/ },
      ]
    : [],
});
