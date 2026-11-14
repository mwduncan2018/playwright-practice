import type { Locator, Page } from '@playwright/test';

/** A dialog that asks before deleting, such as "Delete product". It shows the server's reason if it refuses. */
export class ConfirmDialog {
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly okButton: Locator;
  /** Why the server refused, such as a category that still has products. */
  readonly problem: Locator;

  constructor(page: Page, title: string, confirmLabel = 'Delete') {
    this.dialog = page.getByRole('dialog', { name: title });
    this.confirmButton = this.dialog.getByRole('button', { name: confirmLabel, exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.okButton = this.dialog.getByRole('button', { name: 'OK', exact: true });
    this.problem = this.dialog.getByRole('alert');
  }
}
