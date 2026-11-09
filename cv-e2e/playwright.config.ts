import { existsSync } from 'node:fs';
import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const envFile = path.join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

export default defineConfig({
  testDir: process.env.TEST_APP_FOLDER,
  fullyParallel: process.env.TEST_PARALLEL === "true",
  retries: Number(process.env.TEST_RETRIES || 0),
  workers: Number(process.env.TEST_WORKERS) || undefined,
  forbidOnly: !!process.env.CI,
  reporter: 'html',
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
  ].filter((project) => project.name === process.env.TEST_BROWSER),

});
