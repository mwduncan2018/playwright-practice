import { existsSync } from 'node:fs';
import path from 'node:path';

import { defineConfig, devices, type Project } from '@playwright/test';

// Everything here that changes between runs comes from environment variables. Locally, .env fills in
// what isn't set. README.md lists them all.
const envFile = path.join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const appFolder = process.env.TEST_APP_FOLDER!;
// An app's address is in a variable named after its folder: SUPER_PORTAL_URL for super-portal.
const baseURL = process.env[`${appFolder.toUpperCase().replaceAll('-', '_')}_URL`];
const browsers = (process.env.TEST_BROWSER || 'chromium').split(',').map((name) => name.trim());

const BROWSER_SETTINGS: Record<string, Project['use']> = {
  chromium: { ...devices['Desktop Chrome'] },
  firefox: { ...devices['Desktop Firefox'] },
  webkit: { ...devices['Desktop Safari'] },
  // Branded browsers use the Chrome or Edge installed on the machine (or in the image).
  chrome: { ...devices['Desktop Chrome'], channel: 'chrome' },
  msedge: { ...devices['Desktop Edge'], channel: 'msedge' },
};

export default defineConfig({
  testDir: `apps/${appFolder}/tests`,
  // Every test runs in parallel with every other, in its own browser context.
  fullyParallel: true,
  workers: 2,
  retries: Number(process.env.TEST_RETRIES || 0),
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
    baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: browsers.map((name) => ({ name, use: BROWSER_SETTINGS[name] })),
});
