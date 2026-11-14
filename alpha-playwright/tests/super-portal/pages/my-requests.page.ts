import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class MyRequestsPage extends BasePage {
  readonly path = '/requests';
  readonly search: Locator;
  readonly status: Locator;
  readonly type: Locator;
  /** "Showing 1–7 of 7 requests", or "No requests match these filters." */
  readonly summary: Locator;

  constructor(page: Page) {
    super(page);
    const filters = page.getByRole('search', { name: 'Filter requests' });
    this.search = filters.getByLabel('Search');
    this.status = filters.getByLabel('Status');
    this.type = filters.getByLabel('Type');
    this.summary = page.getByRole('status').filter({ hasText: /^(Showing|No requests)/ });
  }

  /** A request's row. Rows carry test IDs with the request number, such as request-row-REQ-1016. */
  row(requestNumber: string): Locator {
    return this.page.getByTestId(`request-row-${requestNumber}`);
  }
}
