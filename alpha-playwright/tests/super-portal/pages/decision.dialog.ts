import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The Approve or Reject dialog for a request, on the Approvals page or the request's own page. It's
 * titled with the request's number, such as "Approve REQ-1016", and only one is open at a time, so
 * this matches whichever request's dialog is open.
 */
export class DecisionDialog extends BasePage {
  readonly dialog: Locator;
  /** The optional note when approving, the reason when rejecting. */
  readonly noteOrReasonTextarea: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page, decision: 'Approve' | 'Reject') {
    super(page);
    this.dialog = page.getByRole('dialog', { name: new RegExp(`^${decision} REQ-`) });
    this.noteOrReasonTextarea = this.dialog.getByLabel(
      decision === 'Approve' ? 'Note for the requester (optional)' : 'Reason',
    );
    this.confirmButton = this.dialog.getByRole('button', { name: decision, exact: true });
  }
}
