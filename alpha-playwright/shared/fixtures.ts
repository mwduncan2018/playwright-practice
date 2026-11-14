/**
 * The fixtures every application's tests share: who the test is signed in as, and Keycloak.
 * Each app's own fixtures.ts builds on these and adds its page objects.
 */
import { type Browser, type BrowserContext, type Page, expect, test as base } from '@playwright/test';

import { type Account, accountForWorker, passwordVariable, type Role, ROLES } from './accounts';
import { KeycloakPage } from './keycloak.page';

type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

export interface SignInOptions {
  /**
   * Who the test's page is signed in as: 'standard' (the default), 'admin', or 'nobody' for a
   * signed-out page, as in a test of the sign-in page itself. Set it with test.use().
   */
  signedInAs: Role | 'nobody';
}

interface TestFixtures {
  /** The account the test's page is signed in as. Signed-out tests get a standard account to sign in with. */
  user: Account;
  /** Keycloak's sign-in page, on the test's page. */
  keycloak: KeycloakPage;
  /** Another page, in a browser context of its own, signed in as another role: a second person in the test. */
  openPageAs: (role: Role) => Promise<Page>;
}

interface WorkerFixtures {
  /** This worker's account for a role, such as the admin who approves in a two-person test. */
  accountFor: (role: Role) => Account;
  /** This worker's signed-in session for a role. */
  sessionFor: (role: Role) => Promise<StorageState>;
}

/** Signs in through Keycloak in a context of its own and returns the session's cookies. */
async function signIn(browser: Browser, account: Account, baseURL: string): Promise<StorageState> {
  // Were this to run during a test, the new context would inherit the test's options, its signed-in
  // session included, so start it explicitly empty: otherwise Keycloak would sign the wrong person
  // straight back in.
  const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const keycloak = new KeycloakPage(page);
    // Keycloak's address isn't configured here, because the app redirects to it. So this is where a
    // Keycloak that's down shows up.
    await keycloak.username.waitFor({ timeout: 15_000 }).catch(() => {
      throw new Error(`${baseURL} didn't open Keycloak's sign-in page. Is Keycloak running?`);
    });
    await keycloak.signIn(account.username, account.password);
    const appOrigin = new URL(baseURL).origin;
    // Wait to be back on the app, or for Keycloak to say why not, such as a wrong password.
    const outcome = await Promise.race([
      page.waitForURL((url) => url.origin === appOrigin, { timeout: 15_000 }).then(() => 'signed in' as const),
      keycloak.errorMessage.waitFor({ timeout: 15_000 }).then(() => 'refused' as const),
    ]).catch(() => 'no answer' as const);
    if (outcome !== 'signed in') {
      const message =
        outcome === 'refused' ? await keycloak.errorMessage.textContent({ timeout: 1_000 }).catch(() => null) : null;
      throw new Error(
        `Couldn't sign in to ${baseURL} as ${account.username}` +
          (message ? `: Keycloak says "${message.trim()}"` : '') +
          `. Check ${passwordVariable(account.username)}.`,
      );
    }
    return await context.storageState();
  } finally {
    await context.close();
  }
}

export const test = base.extend<SignInOptions & TestFixtures, WorkerFixtures>({
  signedInAs: ['standard', { option: true }],

  accountFor: [
    // Playwright needs the object pattern even when a fixture uses no other fixtures.
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, workerInfo) => {
      await use((role) => accountForWorker(role, workerInfo.parallelIndex));
    },
    { scope: 'worker' },
  ],

  // Every role signs in once per worker, while the worker's first test is being set up, and later
  // tests reuse the sessions. That's before Playwright starts recording the test, because
  // storageState, which needs a session, is one of the context options Playwright settles first. So
  // no sign-in, and no password, shows in a report or a trace, as a second person signing in during
  // a test would. Sessions stay in memory, never in files.
  sessionFor: [
    async ({ browser, accountFor }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL!;
      // async, so that a missing password becomes a failed sign-in like any other.
      const signInAs = async (role: Role) => signIn(browser, accountFor(role), baseURL);
      const sessions = new Map(ROLES.map((role) => [role, signInAs(role)] as const));
      // Wait for every sign-in, but leave a failure to the tests that need that role.
      await Promise.allSettled(sessions.values());
      await use((role) => sessions.get(role)!);
    },
    { scope: 'worker' },
  ],

  storageState: async ({ signedInAs, sessionFor }, use) => {
    await use(signedInAs === 'nobody' ? { cookies: [], origins: [] } : await sessionFor(signedInAs));
  },

  user: async ({ signedInAs, accountFor }, use) => {
    await use(accountFor(signedInAs === 'nobody' ? 'standard' : signedInAs));
  },

  keycloak: async ({ page }, use) => {
    await use(new KeycloakPage(page));
  },

  openPageAs: async ({ browser, sessionFor, baseURL, viewport }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (role) => {
      const context = await browser.newContext({
        baseURL,
        viewport,
        storageState: await sessionFor(role),
      });
      contexts.push(context);
      return context.newPage();
    });
    await Promise.all(contexts.map((context) => context.close()));
  },
});

export { expect };
