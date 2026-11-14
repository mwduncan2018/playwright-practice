import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

/**
 * Keycloak's sign-in page, where an app sends anyone who isn't signed in. Tests reach it through the
 * app, so it has no address of its own to open. Type the password with fillSecret (fill-secret.ts),
 * so it doesn't show in the report.
 */
export class KeycloakPage extends BasePage {
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  /** The message under the fields, such as "Invalid username or password.". */
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Sign in to your account' });
    this.username = page.locator('[name="username"]');
    this.password = page.locator('[name="password"]');
    this.signInButton = page.locator('[name="login"]');
    this.errorMessage = page.locator('#input-error-username');
  }
}
