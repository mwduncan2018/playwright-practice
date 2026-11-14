import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';
import { ConfirmDialog } from './confirm-dialog';

/** A product's own page. */
export class ProductPage extends BasePage {
  /** The page's heading, which is the product's name. */
  readonly heading: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly deleteDialog: ConfirmDialog;
  readonly sku: Locator;
  readonly supplier: Locator;
  readonly price: Locator;
  readonly stock: Locator;
  readonly status: Locator;
  /** When and by whom the product was created. */
  readonly created: Locator;
  /** The product's photo, named "Photo of <product name>". */
  readonly photo: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    // Dialogs render outside <main>, so these never match the dialog's own Delete button.
    const main = page.getByRole('main');
    this.editLink = main.getByRole('link', { name: 'Edit', exact: true });
    this.deleteButton = main.getByRole('button', { name: 'Delete', exact: true });
    this.deleteDialog = new ConfirmDialog(page, 'Delete product');
    // The details have no role or label, so they carry test IDs such as product-price.
    this.sku = page.getByTestId('product-sku');
    this.supplier = page.getByTestId('product-supplier');
    this.price = page.getByTestId('product-price');
    this.stock = page.getByTestId('product-stock');
    this.status = page.getByTestId('product-status');
    this.created = page.getByTestId('product-created');
    this.photo = page.getByRole('img', { name: /^Photo of / });
  }
}
