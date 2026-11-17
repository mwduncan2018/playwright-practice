import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class ProductPage extends BasePage {
  readonly heading: Locator;
  readonly editLink: Locator;
  readonly deleteButton: Locator;
  readonly skuValue: Locator;
  readonly supplierValue: Locator;
  readonly priceValue: Locator;
  readonly stockValue: Locator;
  readonly statusValue: Locator;
  readonly createdValue: Locator;
  readonly photoImage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    const mainRegion = page.getByRole('main');
    this.editLink = mainRegion.getByRole('link', { name: 'Edit', exact: true });
    this.deleteButton = mainRegion.getByRole('button', { name: 'Delete', exact: true });
    this.skuValue = page.getByTestId('product-sku');
    this.supplierValue = page.getByTestId('product-supplier');
    this.priceValue = page.getByTestId('product-price');
    this.stockValue = page.getByTestId('product-stock');
    this.statusValue = page.getByTestId('product-status');
    this.createdValue = page.getByTestId('product-created');
    this.photoImage = page.getByRole('img', { name: /^Photo of / });
  }
}
