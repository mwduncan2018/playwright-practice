import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The home page of app1's site, playwright.dev. An example of a page object that extends the base page. */
export class PlaywrightHomePage extends BasePage {
  readonly getStartedLink: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
  }

  /** Opens the home page at TEST_APP_URL. */
  async open(): Promise<void> {
    await this.page.goto('/');
  }
}
