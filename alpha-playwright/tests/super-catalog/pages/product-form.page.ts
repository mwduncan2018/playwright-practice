import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The New product and Edit product form. Its Status options are radio buttons named Active, Draft and Discontinued. */
export class ProductFormPage extends BasePage {
  readonly path = '/products/new';
  readonly newProductHeading: Locator;
  readonly skuInput: Locator;
  readonly nameInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly categorySelect: Locator;
  readonly supplierSelect: Locator;
  readonly priceInput: Locator;
  readonly stockInput: Locator;
  readonly reorderLevelInput: Locator;
  /** Labelled "Image", or "Replace the image" when the product already has one. */
  readonly imageInput: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.newProductHeading = page.getByRole('heading', { name: 'New product', level: 1 });
    this.skuInput = page.getByLabel('SKU');
    this.nameInput = page.getByLabel('Name', { exact: true });
    this.descriptionTextarea = page.getByLabel('Description');
    this.categorySelect = page.getByLabel('Category');
    this.supplierSelect = page.getByLabel('Supplier');
    this.priceInput = page.getByLabel('Price (USD)');
    this.stockInput = page.getByLabel('Stock', { exact: true });
    this.reorderLevelInput = page.getByLabel('Reorder level');
    this.imageInput = page.getByLabel(/^(Image|Replace the image)$/);
    this.createButton = page.getByRole('button', { name: 'Create product' });
    this.saveButton = page.getByRole('button', { name: 'Save changes' });
  }
}
