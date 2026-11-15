import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The New product and Edit product form. */
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
  // Status, radio buttons in the Status group.
  readonly activeStatusRadio: Locator;
  readonly draftStatusRadio: Locator;
  readonly discontinuedStatusRadio: Locator;
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
    const statusGroup = page.getByRole('group', { name: 'Status', exact: true });
    this.activeStatusRadio = statusGroup.getByRole('radio', { name: 'Active', exact: true });
    this.draftStatusRadio = statusGroup.getByRole('radio', { name: 'Draft', exact: true });
    this.discontinuedStatusRadio = statusGroup.getByRole('radio', { name: 'Discontinued', exact: true });
    this.imageInput = page.getByLabel(/^(Image|Replace the image)$/);
    this.createButton = page.getByRole('button', { name: 'Create product' });
    this.saveButton = page.getByRole('button', { name: 'Save changes' });
  }
}
