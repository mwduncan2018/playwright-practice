import type { Locator, Page } from '@playwright/test';

import { ConfirmDialog, DecisionDialog } from './dialogs';

export type RequestField = 'type' | 'requester' | 'submitted' | 'status' | 'priority' | 'needed-by' | 'reason';
export type RequestTypeDetail =
  | 'item'
  | 'quantity'
  | 'delivery'
  | 'address'
  | 'software'
  | 'license'
  | 'seats'
  | 'system'
  | 'level'
  | 'security-reason'
  | 'training';

/** A request's own page, such as /requests/REQ-1016. */
export class RequestPage {
  /** "REQ-1016 Laptop": the number and title. */
  readonly heading: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly cancelRequestButton: Locator;
  /** Who approved, rejected or cancelled the request, and when, with any note or reason. */
  readonly decision: Locator;
  readonly commentField: Locator;
  readonly postCommentButton: Locator;
  readonly history: Locator;
  readonly historyEntries: Locator;
  readonly cancelDialog: ConfirmDialog;

  constructor(readonly page: Page) {
    // Dialogs render outside <main>, so these never match a dialog's own buttons.
    const main = page.getByRole('main');
    this.heading = main.getByRole('heading', { level: 1 });
    this.approveButton = main.getByRole('button', { name: 'Approve', exact: true });
    this.rejectButton = main.getByRole('button', { name: 'Reject', exact: true });
    this.cancelRequestButton = main.getByRole('button', { name: 'Cancel request', exact: true });
    this.decision = page.getByTestId('request-decision');
    this.commentField = page.getByLabel('Add a comment');
    this.postCommentButton = page.getByRole('button', { name: 'Post comment' });
    this.history = page.getByRole('list', { name: 'History' });
    this.historyEntries = this.history.getByRole('listitem');
    this.cancelDialog = new ConfirmDialog(page, 'Cancel request', {
      confirm: 'Cancel request',
      dismiss: 'Keep request',
    });
  }

  async goto(requestNumber: string): Promise<void> {
    await this.page.goto(`/requests/${requestNumber}`);
  }

  /** A value in the Request card. The values carry test IDs such as request-status. */
  field(name: RequestField): Locator {
    return this.page.getByTestId(`request-${name}`);
  }

  /** A value in the type's own details, such as request-detail-address. */
  detail(name: RequestTypeDetail): Locator {
    return this.page.getByTestId(`request-detail-${name}`);
  }

  decisionDialog(decision: 'Approve' | 'Reject', requestNumber: string): DecisionDialog {
    return new DecisionDialog(this.page, decision, requestNumber);
  }
}
