/**
 * Every setting the tests read, from environment variables. Locally, playwright/.env fills in what
 * isn't set. The same variables work on a laptop, in Docker and in a pipeline; README.md lists them.
 */
import { existsSync, readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { ACCOUNTS } from './accounts';
import { type AppName, APPS } from './apps';

export const BROWSERS = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge'] as const;
export type BrowserName = (typeof BROWSERS)[number];

export interface Shard {
  current: number;
  total: number;
}

export interface Settings {
  app: AppName;
  appUrl: string;
  browsers: BrowserName[];
  workers: number | string;
  shard: Shard | null;
  grep: string | undefined;
  grepInvert: string | undefined;
  retries: number;
  ci: boolean;
}

/** Values in playwright/.env fill in whatever the real environment doesn't set. */
function loadDotEnv(): void {
  const file = path.join(__dirname, '..', '.env');
  if (!existsSync(file)) return;
  for (const [key, value] of Object.entries(parseEnv(readFileSync(file, 'utf8')))) {
    process.env[key] ??= value;
  }
}

function fail(message: string): never {
  throw new Error(`Test settings: ${message} See playwright/README.md.`);
}

function read(variable: string): string | undefined {
  return process.env[variable]?.trim() || undefined;
}

function choose<T extends string>(variable: string, allowed: readonly T[], fallback?: T): T {
  const value = read(variable);
  if (value === undefined) {
    if (fallback !== undefined) return fallback;
    fail(`set ${variable} to one of: ${allowed.join(', ')}.`);
  }
  if (!allowed.includes(value as T)) fail(`${variable} is "${value}", but it must be one of: ${allowed.join(', ')}.`);
  return value as T;
}

function readBrowsers(): BrowserName[] {
  const names = (read('TEST_BROWSER') ?? 'chromium').split(',').map((name) => name.trim());
  for (const name of names) {
    if (!BROWSERS.includes(name as BrowserName)) {
      fail(`TEST_BROWSER has "${name}", but each browser must be one of: ${BROWSERS.join(', ')}.`);
    }
  }
  return [...new Set(names)] as BrowserName[];
}

/**
 * TEST_WORKERS, or else half the CPU cores (Playwright's own default), but no more workers than a
 * role has accounts, so no two workers share one. A test that changes a user's settings, such as
 * SP-010, would collide with a copy of itself running at once on the same account, as happens when
 * one run tests several browsers.
 */
function readWorkers(accountsPerRole: number): number | string {
  const value = read('TEST_WORKERS');
  if (value === undefined) return Math.max(1, Math.min(accountsPerRole, Math.floor(availableParallelism() / 2)));
  if (/^\d+%$/.test(value)) return value;
  if (/^\d+$/.test(value) && Number(value) > 0) return Number(value);
  fail(`TEST_WORKERS is "${value}"; use a number such as 4, or a share of the CPU cores such as 50%.`);
}

/** TEST_SHARD=3/10, or a Kubernetes Indexed Job's JOB_COMPLETION_INDEX (from 0) with TEST_SHARD_TOTAL. */
function readShard(): Shard | null {
  const value = read('TEST_SHARD');
  if (value !== undefined) {
    const match = /^(\d+)\/(\d+)$/.exec(value);
    const current = Number(match?.[1]);
    const total = Number(match?.[2]);
    if (!match || current < 1 || current > total) fail(`TEST_SHARD is "${value}"; use current/total, such as 3/10.`);
    return { current, total };
  }
  const total = read('TEST_SHARD_TOTAL');
  const index = read('JOB_COMPLETION_INDEX');
  if (total === undefined || index === undefined) return null;
  const shards = Number(total);
  const position = Number(index);
  if (!Number.isInteger(shards) || shards < 1 || !Number.isInteger(position) || position < 0 || position >= shards) {
    fail(`JOB_COMPLETION_INDEX ${index} doesn't fit TEST_SHARD_TOTAL ${total}.`);
  }
  return { current: position + 1, total: shards };
}

function readRetries(ci: boolean): number {
  const value = read('TEST_RETRIES');
  if (value === undefined) return ci ? 1 : 0;
  if (!/^\d+$/.test(value)) fail(`TEST_RETRIES is "${value}"; use a whole number such as 1.`);
  return Number(value);
}

/** The address of the application under test, from its variable. Other apps' addresses aren't read. */
function readAppUrl(app: AppName): string {
  const { title, urlVariable } = APPS[app];
  const address = read(urlVariable);
  if (address === undefined) fail(`set ${urlVariable} to ${title}'s address.`);
  if (!/^https?:\/\/\S+$/i.test(address)) {
    fail(`${urlVariable} is "${address}"; use a full address such as https://server.example.com.`);
  }
  return address.replace(/\/+$/, '');
}

function readSettings(): Settings {
  loadDotEnv();
  const app = choose('TEST_APP', Object.keys(APPS) as AppName[]);
  const ci = Boolean(read('CI'));
  return {
    app,
    appUrl: readAppUrl(app),
    browsers: readBrowsers(),
    workers: readWorkers(Math.min(...Object.values(ACCOUNTS).map((accounts) => accounts.length))),
    shard: readShard(),
    grep: read('TEST_GREP'),
    grepInvert: read('TEST_GREP_INVERT'),
    retries: readRetries(ci),
    ci,
  };
}

export const settings: Settings = readSettings();
