import type { Locator, Page } from '@playwright/test';

export class SettingsPage {
  readonly username: Locator;
  readonly roles: Locator;
  readonly defaultPriority: Locator;
  readonly rowsPerPage: Locator;
  readonly saveButton: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByTestId('account-username');
    this.roles = page.getByTestId('account-roles');
    this.defaultPriority = page.getByLabel('Default priority for new requests');
    this.rowsPerPage = page.getByLabel('Rows per page in request lists');
    this.saveButton = page.getByRole('button', { name: 'Save settings' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }
}
