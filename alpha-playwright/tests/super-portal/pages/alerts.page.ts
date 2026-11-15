import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The messages Super Portal pops up at the bottom right, such as "Comment posted." or "Settings
 * saved." They have the alert role, stack, and each disappears after 6 seconds.
 */
export class AlertsPage extends BasePage {
  /** Every message on the page. Narrow them with filter({ hasText }). */
  readonly alertMessages: Locator;
  readonly commentPostedAlert: Locator;
  readonly settingsSavedAlert: Locator;
  readonly announcementDeletedAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.alertMessages = page.getByRole('alert');
    this.commentPostedAlert = this.alertMessages.filter({ hasText: 'Comment posted.' });
    this.settingsSavedAlert = this.alertMessages.filter({ hasText: 'Settings saved.' });
    this.announcementDeletedAlert = this.alertMessages.filter({ hasText: 'Deleted the announcement.' });
  }
}
