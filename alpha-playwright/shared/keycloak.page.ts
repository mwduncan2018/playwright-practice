import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

/**
 * Keycloak's sign-in page, where an app sends anyone who isn't signed in. Tests reach it through the
 * app, so it has no address of its own to open. Type the password with fillSecret (fill-secret.ts),
 * so it doesn't show in the report.
 */
export class KeycloakPage extends BasePage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  /** The message under the fields, such as "Invalid username or password.". */
  readonly errorMessageText: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Sign in to your account' });
    this.usernameInput = page.locator('[name="username"]');
    this.passwordInput = page.locator('[name="password"]');
    this.signInButton = page.locator('[name="login"]');
    this.errorMessageText = page.locator('#input-error-username');
  }
}
