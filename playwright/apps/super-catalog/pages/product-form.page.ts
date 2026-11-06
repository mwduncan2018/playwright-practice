import type { Locator, Page } from '@playwright/test';

export interface ProductData {
  sku: string;
  name: string;
  category: string;
  supplier?: string;
  price: string;
  stock: string;
  status?: 'Active' | 'Draft' | 'Discontinued';
}

/** The New product and Edit product form. */
export class ProductFormPage {
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

  constructor(readonly page: Page) {
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

  async goto(): Promise<void> {
    await this.page.goto('/products/new');
  }

  status(value: NonNullable<ProductData['status']>): Locator {
    return this.page.getByRole('radio', { name: value, exact: true });
  }

  async fill(product: ProductData): Promise<void> {
    await this.sku.fill(product.sku);
    await this.name.fill(product.name);
    await this.category.selectOption(product.category);
    if (product.supplier) await this.supplier.selectOption(product.supplier);
    await this.price.fill(product.price);
    await this.stock.fill(product.stock);
    if (product.status) await this.status(product.status).check();
  }

  /** Fills in a new product and selects Create product. */
  async create(product: ProductData): Promise<void> {
    await this.fill(product);
    await this.createButton.click();
  }
}
