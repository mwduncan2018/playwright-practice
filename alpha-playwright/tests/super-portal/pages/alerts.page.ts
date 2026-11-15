import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The messages Super Portal shows on a page, such as "Comment posted." or "Settings saved.", and
 * notices such as "You can't approve or reject your own request." They have the alert role.
 */
export class AlertsPage extends BasePage {
  /** Every message on the page. Narrow them with filter({ hasText }). */
  readonly messages: Locator;

  constructor(page: Page) {
    super(page);
    this.messages = page.getByRole('alert');
  }
}
