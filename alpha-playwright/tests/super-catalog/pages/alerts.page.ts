import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The messages Super Catalog shows on a page, such as "Created ..." after saving a product. They have
 * the alert role.
 */
export class AlertsPage extends BasePage {
  /** Every message on the page. Narrow them with filter({ hasText }). */
  readonly alertMessages: Locator;

  constructor(page: Page) {
    super(page);
    this.alertMessages = page.getByRole('alert');
  }
}
