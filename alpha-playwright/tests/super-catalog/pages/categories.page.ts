import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class CategoriesPage extends BasePage {
  readonly path = '/categories';
  readonly newCategoryButton: Locator;
  readonly categoriesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.newCategoryButton = page.getByRole('button', { name: 'New category' });
    this.categoriesTable = page.getByRole('table', { name: 'Categories' });
  }

  categoryRow(name: string): Locator {
    return this.categoriesTable.getByRole('row').filter({ has: this.page.getByRole('cell', { name, exact: true }) });
  }

  /** The number of products in the category, which links to them. */
  productCountLink(name: string): Locator {
    return this.categoryRow(name).getByRole('link');
  }

  editButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${name}`, exact: true });
  }

  deleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${name}`, exact: true });
  }
}
