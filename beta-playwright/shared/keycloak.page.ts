import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

/**
 * Keycloak's sign-in page, where an app sends anyone who isn't signed in. Tests reach it through the
 * app, so it has no address of its own to open.
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

  /**
   * Signs in with a username and password. The password doesn't show in the test report, but a
   * trace records it, so a test that signs in turns its trace off: test.use({ trace: 'off' }).
   */
  async signIn(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.fillSecret(this.password, password);
    await this.signInButton.click();
  }

  /**
   * Returns the error message's text, once it's on the page. It doesn't wait for the text to change,
   * so to check the message, use `await expect(keycloak.errorMessage).toHaveText(...)` instead: it
   * keeps checking until the text matches.
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.innerText()).trim();
  }

  /**
   * Types a secret into a field without it showing in the report, where fill() would show it in its
   * step's title, as Fill "<the secret>". It clicks the field as a person would, then sets the value
   * through the browser's own setter and sends the events a typed value sends.
   */
  private async fillSecret(field: Locator, secret: string): Promise<void> {
    await field.click();
    await field.evaluate((input: HTMLInputElement, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }, secret);
  }
}
