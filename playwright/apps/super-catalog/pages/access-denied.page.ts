import type { Locator, Page } from '@playwright/test';

/** What a standard user sees on an admin page. */
export class AccessDeniedPage {
  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: "You don't have access to this page" });
  }
}
