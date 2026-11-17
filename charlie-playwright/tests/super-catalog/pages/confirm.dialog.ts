import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class ConfirmDialog extends BasePage {
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly okButton: Locator;
  readonly problemAlert: Locator;

  constructor(page: Page, title: string, confirmLabel = 'Delete') {
    super(page);
    this.dialog = page.getByRole('dialog', { name: title });
    this.confirmButton = this.dialog.getByRole('button', { name: confirmLabel, exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.okButton = this.dialog.getByRole('button', { name: 'OK', exact: true });
    this.problemAlert = this.dialog.getByRole('alert');
  }
}
