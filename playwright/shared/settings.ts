/**
 * Every setting the tests read, from environment variables. Locally, playwright/.env fills in what
 * isn't set. The same variables work on a laptop, in Docker and in a pipeline; README.md lists them.
 */
import { existsSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';

import { ACCOUNTS } from './accounts';

const envFile = path.join(__dirname, '..', '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const app = process.env.TEST_APP!;

// An app's address is in a variable named after it: SUPER_PORTAL_URL for super-portal.
const urlVariable = `${app.toUpperCase().replaceAll('-', '_')}_URL`;

// Half the CPU cores (Playwright's own default), but no more workers than a role has accounts, so no
// two workers share one. A test that changes a user's settings, such as SP-010, would collide with a
// copy of itself running at once on the same account.
const accountsPerRole = Math.min(...Object.values(ACCOUNTS).map((accounts) => accounts.length));
const defaultWorkers = Math.max(1, Math.min(accountsPerRole, Math.floor(availableParallelism() / 2)));

// Playwright takes a number or a percentage, but not a number written as text.
const workers = process.env.TEST_WORKERS;

export const settings = {
  app,
  appUrl: process.env[urlVariable]!,
  urlVariable,
  browsers: (process.env.TEST_BROWSER || 'chromium').split(',').map((name) => name.trim()),
  workers: workers?.endsWith('%') ? workers : Number(workers) || defaultWorkers,
  retries: Number(process.env.TEST_RETRIES || 0),
};
