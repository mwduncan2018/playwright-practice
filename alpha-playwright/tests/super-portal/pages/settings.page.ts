import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class SettingsPage extends BasePage {
  readonly path = '/settings';
  readonly username: Locator;
  readonly roles: Locator;
  readonly defaultPriority: Locator;
  readonly rowsPerPage: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByTestId('account-username');
    this.roles = page.getByTestId('account-roles');
    this.defaultPriority = page.getByLabel('Default priority for new requests');
    this.rowsPerPage = page.getByLabel('Rows per page in request lists');
    this.saveButton = page.getByRole('button', { name: 'Save settings' });
  }
}
