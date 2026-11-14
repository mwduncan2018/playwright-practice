import type { Locator, Page } from '@playwright/test';

import { fillSecret } from './fill-secret';

/** Keycloak's sign-in page, where both applications send anyone who isn't signed in. */
export class KeycloakSignInPage {
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  /**
   * The message under the fields, such as "Invalid username or password.". Keycloak's page isn't
   * ours and gives this message no role or test ID, so this uses Keycloak's own class for it.
   */
  readonly errorMessage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Sign in to your account' });
    this.username = page.getByLabel('Username or email');
    this.password = page.getByLabel('Password', { exact: true });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.locator('.kc-feedback-text');
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await fillSecret(this.password, password);
    await this.signInButton.click();
  }
}
