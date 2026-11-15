import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class DashboardPage extends BasePage {
  readonly path = '/';
  readonly heading: Locator;
  readonly lowStockLink: Locator;
  readonly productsCardNumber: Locator;
  readonly activeProductsCardNumber: Locator;
  readonly lowStockCardNumber: Locator;
  readonly categoriesCardNumber: Locator;
  readonly suppliersCardNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 1 });
    this.lowStockLink = page.getByRole('link', { name: 'See all low-stock products' });
    // The number on each count card. The cards have no role or label of their own, so they carry
    // test IDs such as stat-products.
    const cardNumber = (name: string) => page.getByTestId(`stat-${name}`).getByText(/^\d+$/);
    this.productsCardNumber = cardNumber('products');
    this.activeProductsCardNumber = cardNumber('active');
    this.lowStockCardNumber = cardNumber('low-stock');
    this.categoriesCardNumber = cardNumber('categories');
    this.suppliersCardNumber = cardNumber('suppliers');
  }
}
