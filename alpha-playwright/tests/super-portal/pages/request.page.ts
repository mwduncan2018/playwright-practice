import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

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
  readonly decisionAlert: Locator;
  readonly commentTextarea: Locator;
  readonly postCommentButton: Locator;
  readonly historyList: Locator;
  readonly historyListItems: Locator;
  readonly statusValue: Locator;
  /** Equipment requests' delivery address. */
  readonly deliveryAddressValue: Locator;
  /** Software requests' number of seats. */
  readonly seatsValue: Locator;
  /** Access requests' access level. */
  readonly accessLevelValue: Locator;
  /** Administrator access requests' security training answer. */
  readonly securityTrainingValue: Locator;

  constructor(page: Page) {
    super(page);
    // Dialogs render outside <main>, so these never match a dialog's own buttons.
    const mainRegion = page.getByRole('main');
    this.heading = mainRegion.getByRole('heading', { level: 1 });
    this.approveButton = mainRegion.getByRole('button', { name: 'Approve', exact: true });
    this.rejectButton = mainRegion.getByRole('button', { name: 'Reject', exact: true });
    this.cancelRequestButton = mainRegion.getByRole('button', { name: 'Cancel request', exact: true });
    this.decisionAlert = page.getByTestId('request-decision');
    this.commentTextarea = page.getByLabel('Add a comment');
    this.postCommentButton = page.getByRole('button', { name: 'Post comment' });
    this.historyList = page.getByRole('list', { name: 'History' });
    this.historyListItems = this.historyList.getByRole('listitem');
    // The values carry test IDs: request-<name> in the Request card, request-detail-<name> in the
    // type's own details.
    this.statusValue = page.getByTestId('request-status');
    this.deliveryAddressValue = page.getByTestId('request-detail-address');
    this.seatsValue = page.getByTestId('request-detail-seats');
    this.accessLevelValue = page.getByTestId('request-detail-level');
    this.securityTrainingValue = page.getByTestId('request-detail-training');
  }
}
