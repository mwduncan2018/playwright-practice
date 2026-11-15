import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** A dialog that asks before something that can't be undone, such as "Cancel request". */
export class ConfirmDialog extends BasePage {
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly dismissButton: Locator;

  constructor(page: Page, title: string, { confirm = 'Delete', dismiss = 'Cancel' } = {}) {
    super(page);
    this.dialog = page.getByRole('dialog', { name: title });
    this.confirmButton = this.dialog.getByRole('button', { name: confirm, exact: true });
    this.dismissButton = this.dialog.getByRole('button', { name: dismiss, exact: true });
  }
}
