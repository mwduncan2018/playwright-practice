import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class RequestPage extends BasePage {
  readonly path = '/requests/';
  readonly heading: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly cancelRequestButton: Locator;
  readonly decisionAlert: Locator;
  readonly commentTextarea: Locator;
  readonly postCommentButton: Locator;
  readonly historyList: Locator;
  readonly historyListItems: Locator;
  readonly lastHistoryListItem: Locator;
  readonly ownRequestNoticeAlert: Locator;
  readonly statusValue: Locator;
  readonly deliveryAddressValue: Locator;
  readonly seatsValue: Locator;
  readonly accessLevelValue: Locator;
  readonly securityTrainingValue: Locator;

  constructor(page: Page) {
    super(page);
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
    this.lastHistoryListItem = this.historyListItems.last();
    this.ownRequestNoticeAlert = mainRegion
      .getByRole('alert')
      .filter({ hasText: "You can't approve or reject your own request. Another admin will decide on it." });
    this.statusValue = page.getByTestId('request-status');
    this.deliveryAddressValue = page.getByTestId('request-detail-address');
    this.seatsValue = page.getByTestId('request-detail-seats');
    this.accessLevelValue = page.getByTestId('request-detail-level');
    this.securityTrainingValue = page.getByTestId('request-detail-training');
  }
}
