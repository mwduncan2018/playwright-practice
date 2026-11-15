import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class MyRequestsPage extends BasePage {
  readonly path = '/requests';
  readonly searchInput: Locator;
  readonly statusSelect: Locator;
  readonly typeSelect: Locator;
  /** "Showing 1–7 of 7 requests", or "No requests match these filters." */
  readonly summaryText: Locator;

  constructor(page: Page) {
    super(page);
    const filterForm = page.getByRole('search', { name: 'Filter requests' });
    this.searchInput = filterForm.getByLabel('Search');
    this.statusSelect = filterForm.getByLabel('Status');
    this.typeSelect = filterForm.getByLabel('Type');
    this.summaryText = page.getByRole('status').filter({ hasText: /^(Showing|No requests)/ });
  }

  /** A request's row. Rows carry test IDs with the request number, such as request-row-REQ-1016. */
  requestRow(requestNumber: string): Locator {
    return this.page.getByTestId(`request-row-${requestNumber}`);
  }
}
