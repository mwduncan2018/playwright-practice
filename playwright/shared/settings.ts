/**
 * Every setting the tests read, from environment variables. Locally, playwright/.env fills in what
 * isn't set. The same variables work on a laptop, in Docker and in a pipeline; README.md lists them.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

const envFile = path.join(__dirname, '..', '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const app = process.env.TEST_APP!;

// An app's address is in a variable named after it: SUPER_PORTAL_URL for super-portal.
const urlVariable = `${app.toUpperCase().replaceAll('-', '_')}_URL`;

export const settings = {
  app,
  appUrl: process.env[urlVariable]!,
  urlVariable,
  browsers: (process.env.TEST_BROWSER || 'chromium').split(',').map((name) => name.trim()),
  retries: Number(process.env.TEST_RETRIES || 0),
};
