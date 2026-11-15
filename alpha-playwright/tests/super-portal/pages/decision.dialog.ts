import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class DecisionDialog extends BasePage {
  readonly dialog: Locator;
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
