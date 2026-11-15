import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class ActivityLogPage extends BasePage {
  readonly path = '/activity';
  readonly userSelect: Locator;
  readonly actionSelect: Locator;
  readonly typeSelect: Locator;
  readonly activityLogTable: Locator;

  constructor(page: Page) {
    super(page);
    const filterForm = page.getByRole('search', { name: 'Filter the activity log' });
    this.userSelect = filterForm.getByLabel('User');
    this.actionSelect = filterForm.getByLabel('Action');
    this.typeSelect = filterForm.getByLabel('Type');
    this.activityLogTable = page.getByRole('table', { name: 'Activity log' });
  }

  updatedEntryRows(itemName: string): Locator {
    return this.activityLogTable
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: itemName, exact: true }) })
      .filter({ has: this.page.getByRole('cell', { name: 'Updated', exact: true }) });
  }
}
