import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class SettingsPage extends BasePage {
  readonly usernameValue: Locator;
  readonly rolesValue: Locator;
  readonly defaultPrioritySelect: Locator;
  readonly rowsPerPageSelect: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameValue = page.getByTestId('account-username');
    this.rolesValue = page.getByTestId('account-roles');
    this.defaultPrioritySelect = page.getByLabel('Default priority for new requests');
    this.rowsPerPageSelect = page.getByLabel('Rows per page in request lists');
    this.saveButton = page.getByRole('button', { name: 'Save settings' });
  }
}
