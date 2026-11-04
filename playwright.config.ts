import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/** WORKERS may be a count ("4") or a share of CPU cores ("50%"). Unset uses Playwright's default. */
function workersFromEnv(): number | string | undefined {
  const value = process.env.WORKERS?.trim();
  if (!value) return undefined;
  return value.endsWith('%') ? value : Number(value);
}

export default defineConfig({
  testDir: './tests',

  // Every test in every file may run in parallel, so tests must not depend on each other.
  fullyParallel: true,
  workers: workersFromEnv(),

  // A stray test.only fails the run in CI instead of silently skipping the rest of the suite.
  forbidOnly: isCI,

  // One retry in CI lets the report flag flaky tests; none locally so flakiness shows up as a failure.
  retries: isCI ? 1 : 0,

  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // Locally the site is on this machine. In Docker, docker-compose.yml points BASE_URL at the host.
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:8077',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
