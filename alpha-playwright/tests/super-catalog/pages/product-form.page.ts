import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The New product and Edit product form. Its Status options are radio buttons named Active, Draft and Discontinued. */
export class ProductFormPage extends BasePage {
  readonly path = '/products/new';
  readonly newProductHeading: Locator;
  readonly sku: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly supplier: Locator;
  readonly price: Locator;
  readonly stock: Locator;
  readonly reorderLevel: Locator;
  /** Labelled "Image", or "Replace the image" when the product already has one. */
  readonly image: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newProductHeading = page.getByRole('heading', { name: 'New product', level: 1 });
    this.sku = page.getByLabel('SKU');
    this.name = page.getByLabel('Name', { exact: true });
    this.description = page.getByLabel('Description');
    this.category = page.getByLabel('Category');
    this.supplier = page.getByLabel('Supplier');
    this.price = page.getByLabel('Price (USD)');
    this.stock = page.getByLabel('Stock', { exact: true });
    this.reorderLevel = page.getByLabel('Reorder level');
    this.image = page.getByLabel(/^(Image|Replace the image)$/);
    this.createButton = page.getByRole('button', { name: 'Create product' });
    this.saveButton = page.getByRole('button', { name: 'Save changes' });
  }
}
