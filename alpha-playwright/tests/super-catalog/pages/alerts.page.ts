import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class AlertsPage extends BasePage {
  readonly alertMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.alertMessages = page.getByRole('alert');
  }
}
