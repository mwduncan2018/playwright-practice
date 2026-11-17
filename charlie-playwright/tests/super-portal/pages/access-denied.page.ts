import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class AccessDeniedPage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: "You don't have access to this page" });
  }
}
