import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';
import { ConfirmDialog } from './confirm-dialog';

export type ProductDetail =
  | 'sku'
  | 'category'
  | 'supplier'
  | 'price'
  | 'stock'
  | 'reorder-level'
  | 'status'
  | 'description'
  | 'created'
  | 'updated';

/** A product's own page. */
export class ProductPage extends BasePage {
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly deleteDialog: ConfirmDialog;

  constructor(page: Page) {
    super(page);
    // Dialogs render outside <main>, so these never match the dialog's own Delete button.
    const main = page.getByRole('main');
    this.editLink = main.getByRole('link', { name: 'Edit', exact: true });
    this.deleteButton = main.getByRole('button', { name: 'Delete', exact: true });
    this.deleteDialog = new ConfirmDialog(page, 'Delete product');
  }

  heading(productName: string): Locator {
    return this.page.getByRole('heading', { name: productName, level: 1 });
  }

  /** A value in the details list. The values have no role or label, so they carry test IDs such as product-price. */
  detail(name: ProductDetail): Locator {
    return this.page.getByTestId(`product-${name}`);
  }

  photo(productName: string): Locator {
    return this.page.getByRole('img', { name: `Photo of ${productName}` });
  }
}
