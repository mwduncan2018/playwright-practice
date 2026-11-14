/**
 * The fixtures every application's tests share: who the test is signed in as, and Keycloak.
 * Each app's own fixtures.ts builds on these and adds its page objects.
 */
import { type BrowserContext, type Page, expect, test as base } from '@playwright/test';

import { type Account, account, type AccountName, type Role, sessionFile } from './accounts';
import { KeycloakPage } from './keycloak.page';

export interface SignInOptions {
  /**
   * Who the test's page is signed in as: 'standard' (the default), 'admin', a side account such as
   * 'standard-side' for a test that changes the user's own data (tag that test @side-account), or
   * 'nobody' for a signed-out page, as in a test of the sign-in page itself. Set it with test.use().
   */
  signedInAs: AccountName | 'nobody';
}

interface TestFixtures {
  /** The account the test's page is signed in as. Signed-out tests get the standard account to sign in with. */
  user: Account;
  /** The shared account for a role, such as the admin who approves in a two-person test. */
  accountFor: (role: Role) => Account;
  /** Keycloak's sign-in page, on the test's page. */
  keycloak: KeycloakPage;
  /** Another page, in a browser context of its own, signed in as another role: a second person in the test. */
  openPageAs: (role: Role) => Promise<Page>;
}

export const test = base.extend<SignInOptions & TestFixtures>({
  signedInAs: ['standard', { option: true }],

  // Every test starts from a session the setup project saved (shared/auth.setup.ts), so no test signs in.
  storageState: async ({ signedInAs }, use) => {
    await use(signedInAs === 'nobody' ? { cookies: [], origins: [] } : sessionFile(signedInAs));
  },

  user: async ({ signedInAs }, use) => {
    await use(account(signedInAs === 'nobody' ? 'standard' : signedInAs));
  },

  // Playwright needs the object pattern even when a fixture uses no other fixtures.
  // eslint-disable-next-line no-empty-pattern
  accountFor: async ({}, use) => {
    await use((role) => account(role));
  },

  keycloak: async ({ page }, use) => {
    await use(new KeycloakPage(page));
  },

  openPageAs: async ({ browser, baseURL, viewport }, use) => {
    const contexts: BrowserContext[] = [];
    await use(async (role) => {
      const context = await browser.newContext({ baseURL, viewport, storageState: sessionFile(role) });
      contexts.push(context);
      return context.newPage();
    });
    await Promise.all(contexts.map((context) => context.close()));
  },
});

export { expect };
