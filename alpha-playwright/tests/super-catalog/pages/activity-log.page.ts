import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The admins' activity log. */
export class ActivityLogPage extends BasePage {
  readonly path = '/activity';
  readonly user: Locator;
  readonly action: Locator;
  readonly type: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    const filters = page.getByRole('search', { name: 'Filter the activity log' });
    this.user = filters.getByLabel('User');
    this.action = filters.getByLabel('Action');
    this.type = filters.getByLabel('Type');
    this.table = page.getByRole('table', { name: 'Activity log' });
  }

  /** Entries whose row mentions the text, such as a product's "SKU name" label. */
  entries(text: string): Locator {
    return this.table.getByRole('row').filter({ hasText: text });
  }
}
