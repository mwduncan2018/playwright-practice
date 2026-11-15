/**
 * The fixtures every application's tests share: the users in a test. Each user is a fixture named
 * after the account they're signed in as, with a browser of their own and the app's page objects on
 * it, so a test reads as who does what: adminUser.productsPage.newProduct.click(). Each app's
 * fixtures.ts adds its page objects with testWithUsers().
 */
import { type Browser, type Page, expect, test as base } from '@playwright/test';

import { type Account, account, type AccountName, sessionFile } from './accounts';
import { KeycloakPage } from './keycloak.page';

/** What every user has, whatever the app. */
interface UserBasics {
  /** The user's own page, in a browser context of their own. */
  page: Page;
  /** Keycloak's sign-in page, on the user's page. */
  keycloakPage: KeycloakPage;
}

/** A signed-in user: their page, their account, and the app's page objects on their page. */
export type SignedInUser<AppPages> = AppPages & UserBasics & { account: Account };

/** A user who isn't signed in: their page and the app's page objects on it. */
export type SignedOutUser<AppPages> = AppPages & UserBasics;

export interface Users<AppPages> {
  /** Standard One, on the shared standard account. Tests on it mustn't change the user's own data. */
  standardUser: SignedInUser<AppPages>;
  /** Admin One, on the shared admin account. Tests on it mustn't change the user's own data. */
  adminUser: SignedInUser<AppPages>;
  /**
   * Standard Two, on a side account, for a test that changes the user's own data, such as Settings.
   * The test must be tagged @side-account, which runs it one test at a time.
   */
  standardSideUser: SignedInUser<AppPages>;
  /** Someone who isn't signed in, as in a test of the sign-in page itself. */
  signedOutUser: SignedOutUser<AppPages>;
}

/**
 * The test function for an app's tests, with every user in Users. Playwright only sets up the users
 * a test asks for, so a test with one user opens one browser context.
 */
export function testWithUsers<AppPages extends object>(createAppPages: (page: Page) => AppPages) {
  /**
   * Opens a browser context for one user, starting from the session the setup project saved
   * (shared/auth.setup.ts), or signed out, and closes it after the test. Playwright gives a context
   * made this way the config's use options, such as baseURL, and traces it like the test's own page.
   */
  async function openAs<User>(
    browser: Browser,
    accountName: AccountName | undefined,
    createUser: (userBasics: UserBasics) => User,
    use: (user: User) => Promise<void>,
  ): Promise<void> {
    const browserContext = await browser.newContext({
      storageState: accountName ? sessionFile(accountName) : undefined,
    });
    const page = await browserContext.newPage();
    await use(createUser({ page, keycloakPage: new KeycloakPage(page) }));
    await browserContext.close();
  }

  function signedIn(accountName: AccountName) {
    return (userBasics: UserBasics): SignedInUser<AppPages> => ({
      ...createAppPages(userBasics.page),
      ...userBasics,
      account: account(accountName),
    });
  }

  return base.extend<Users<AppPages>>({
    standardUser: async ({ browser }, use) => {
      await openAs(browser, 'standard', signedIn('standard'), use);
    },

    adminUser: async ({ browser }, use) => {
      await openAs(browser, 'admin', signedIn('admin'), use);
    },

    standardSideUser: async ({ browser }, use, testInfo) => {
      // A test on a side account runs apart from the tests on shared accounts only when it's tagged.
      if (!testInfo.tags.includes('@side-account')) {
        throw new Error(
          "standardSideUser is on a side account, for a test that changes the user's own data. Tag the " +
            'test @side-account, which runs it one test at a time, apart from the tests on shared accounts.',
        );
      }
      await openAs(browser, 'standard-side', signedIn('standard-side'), use);
    },

    signedOutUser: async ({ browser }, use) => {
      await openAs(
        browser,
        undefined,
        (userBasics): SignedOutUser<AppPages> => ({ ...createAppPages(userBasics.page), ...userBasics }),
        use,
      );
    },
  });
}

export { expect };
