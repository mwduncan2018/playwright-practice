import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** A product's own page. */
export class ProductPage extends BasePage {
  /** The page's heading, which is the product's name. */
  readonly heading: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly skuValue: Locator;
  readonly supplierValue: Locator;
  readonly priceValue: Locator;
  readonly stockValue: Locator;
  readonly statusValue: Locator;
  /** When and by whom the product was created. */
  readonly createdValue: Locator;
  /** The product's photo, named "Photo of <product name>". */
  readonly photoImage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    // Dialogs render outside <main>, so these never match the dialog's own Delete button.
    const mainRegion = page.getByRole('main');
    this.editLink = mainRegion.getByRole('link', { name: 'Edit', exact: true });
    this.deleteButton = mainRegion.getByRole('button', { name: 'Delete', exact: true });
    // The details have no role or label, so they carry test IDs such as product-price.
    this.skuValue = page.getByTestId('product-sku');
    this.supplierValue = page.getByTestId('product-supplier');
    this.priceValue = page.getByTestId('product-price');
    this.stockValue = page.getByTestId('product-stock');
    this.statusValue = page.getByTestId('product-status');
    this.createdValue = page.getByTestId('product-created');
    this.photoImage = page.getByRole('img', { name: /^Photo of / });
  }
}
