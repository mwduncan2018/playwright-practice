import { type Browser, type Page, expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';

import { type Account, account, type AccountName, sessionFile } from './accounts';
import { KeycloakPage } from './keycloak.page';

interface UserBasics {
  page: Page;
  keycloakPage: KeycloakPage;
}

export type SignedInUser<AppPages> = AppPages & UserBasics & { account: Account };

export type SignedOutUser<AppPages> = AppPages & UserBasics;

export interface Users<AppPages> {
  standardUser: SignedInUser<AppPages>;
  adminUser: SignedInUser<AppPages>;
  standardSideUser: SignedInUser<AppPages>;
  signedOutUser: SignedOutUser<AppPages>;
}

export function testWithUsers<AppPages extends object>(createAppPages: (page: Page) => AppPages) {
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
    if (accountName) await page.goto('/');
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
