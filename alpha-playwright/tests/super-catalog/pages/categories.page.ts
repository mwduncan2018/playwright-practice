import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class CategoriesPage extends BasePage {
  readonly path = '/categories';
  readonly newCategoryButton: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    this.newCategoryButton = page.getByRole('button', { name: 'New category' });
    this.table = page.getByRole('table', { name: 'Categories' });
  }

  row(name: string): Locator {
    return this.table.getByRole('row').filter({ has: this.page.getByRole('cell', { name, exact: true }) });
  }

  /** The number of products in the category, which links to them. */
  productCount(name: string): Locator {
    return this.row(name).getByRole('link');
  }

  editButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${name}`, exact: true });
  }

  deleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${name}`, exact: true });
  }
}
