import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';
import { ConfirmDialog, DecisionDialog } from './dialogs';

/** A request's own page, such as /requests/REQ-1016. */
export class RequestPage extends BasePage {
  /** The start of a request's address. Add the request's number, such as REQ-1016. */
  readonly path = '/requests/';
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
  readonly approveDialog: DecisionDialog;
  readonly rejectDialog: DecisionDialog;
  readonly status: Locator;
  /** Equipment requests' delivery address. */
  readonly address: Locator;
  /** Software requests' number of seats. */
  readonly seats: Locator;
  /** Access requests' access level. */
  readonly accessLevel: Locator;
  /** Administrator access requests' security training answer. */
  readonly securityTraining: Locator;

  constructor(page: Page) {
    super(page);
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
    this.approveDialog = new DecisionDialog(page, 'Approve');
    this.rejectDialog = new DecisionDialog(page, 'Reject');
    // The values carry test IDs: request-<name> in the Request card, request-detail-<name> in the
    // type's own details.
    this.status = page.getByTestId('request-status');
    this.address = page.getByTestId('request-detail-address');
    this.seats = page.getByTestId('request-detail-seats');
    this.accessLevel = page.getByTestId('request-detail-level');
    this.securityTraining = page.getByTestId('request-detail-training');
  }
}
