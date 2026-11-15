import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The admins' queue of requests waiting for a decision. */
export class ApprovalsPage extends BasePage {
  readonly path = '/approvals';
  /** "6 requests waiting", or "Nothing is waiting for approval." */
  readonly summary: Locator;

  constructor(page: Page) {
    super(page);
    this.summary = page.getByRole('status').filter({ hasText: /waiting/ });
  }

  row(requestNumber: string): Locator {
    return this.page.getByTestId(`request-row-${requestNumber}`);
  }

  approveButton(requestNumber: string): Locator {
    return this.page.getByRole('button', { name: `Approve ${requestNumber}`, exact: true });
  }
}
