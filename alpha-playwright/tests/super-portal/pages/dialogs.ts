import type { Locator, Page } from '@playwright/test';

/** A dialog that asks before something that can't be undone, such as "Cancel request". */
export class ConfirmDialog {
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly dismissButton: Locator;

  constructor(page: Page, title: string, { confirm = 'Delete', dismiss = 'Cancel' } = {}) {
    this.dialog = page.getByRole('dialog', { name: title });
    this.confirmButton = this.dialog.getByRole('button', { name: confirm, exact: true });
    this.dismissButton = this.dialog.getByRole('button', { name: dismiss, exact: true });
  }
}

/** The Approve or Reject dialog for a request, titled with its number, such as "Approve REQ-1016". */
export class DecisionDialog {
  readonly dialog: Locator;
  /** The optional note when approving, the reason when rejecting. */
  readonly text: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page, decision: 'Approve' | 'Reject', requestNumber: string) {
    this.dialog = page.getByRole('dialog', { name: `${decision} ${requestNumber}` });
    this.text = this.dialog.getByLabel(decision === 'Approve' ? 'Note for the requester (optional)' : 'Reason');
    this.confirmButton = this.dialog.getByRole('button', { name: decision, exact: true });
  }
}
