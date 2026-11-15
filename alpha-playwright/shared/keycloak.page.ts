import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export class KeycloakPage extends BasePage {
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
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
