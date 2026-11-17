import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class ApprovalsPage extends BasePage {
  readonly summaryText: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryText = page.getByRole('status').filter({ hasText: /waiting/ });
  }

  requestRow(requestNumber: string): Locator {
    return this.page.getByTestId(`request-row-${requestNumber}`);
  }

  requestNumberLink(requestNumber: string): Locator {
    return this.requestRow(requestNumber).getByRole('link', { name: requestNumber, exact: true });
  }

  approveButton(requestNumber: string): Locator {
    return this.page.getByRole('button', { name: `Approve ${requestNumber}`, exact: true });
  }
}
