import type { Locator, Page } from '@playwright/test';

import { ConfirmDialog } from './confirm-dialog';

/** The New category and Edit dialogs. */
export class CategoryDialog {
  readonly dialog: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly saveButton: Locator;

  constructor(page: Page, title: string) {
    this.dialog = page.getByRole('dialog', { name: title });
    this.name = this.dialog.getByLabel('Name');
    this.description = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
  }
}

export class CategoriesPage {
  readonly newCategoryButton: Locator;
  readonly table: Locator;
  readonly newCategoryDialog: CategoryDialog;
  readonly deleteDialog: ConfirmDialog;

  constructor(readonly page: Page) {
    this.newCategoryButton = page.getByRole('button', { name: 'New category' });
    this.table = page.getByRole('table', { name: 'Categories' });
    this.newCategoryDialog = new CategoryDialog(page, 'New category');
    this.deleteDialog = new ConfirmDialog(page, 'Delete category');
  }

  async goto(): Promise<void> {
    await this.page.goto('/categories');
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

  /** The Edit dialog is titled with the category's name before the change. */
  editDialog(name: string): CategoryDialog {
    return new CategoryDialog(this.page, `Edit ${name}`);
  }
}
