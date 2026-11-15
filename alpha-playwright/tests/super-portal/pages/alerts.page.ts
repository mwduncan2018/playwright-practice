import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class AlertsPage extends BasePage {
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
