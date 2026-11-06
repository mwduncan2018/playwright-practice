import type { Locator, Page } from '@playwright/test';

import { DecisionDialog } from './dialogs';

/** The admins' queue of requests waiting for a decision. */
export class ApprovalsPage {
  /** "6 requests waiting", or "Nothing is waiting for approval." */
  readonly summary: Locator;

  constructor(readonly page: Page) {
    this.summary = page.getByRole('status').filter({ hasText: /waiting/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/approvals');
  }

  row(requestNumber: string): Locator {
    return this.page.getByTestId(`request-row-${requestNumber}`);
  }

  approveButton(requestNumber: string): Locator {
    return this.page.getByRole('button', { name: `Approve ${requestNumber}`, exact: true });
  }

  rejectButton(requestNumber: string): Locator {
    return this.page.getByRole('button', { name: `Reject ${requestNumber}`, exact: true });
  }

  decisionDialog(decision: 'Approve' | 'Reject', requestNumber: string): DecisionDialog {
    return new DecisionDialog(this.page, decision, requestNumber);
  }
}
