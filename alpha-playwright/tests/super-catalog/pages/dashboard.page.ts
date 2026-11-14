import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class DashboardPage extends BasePage {
  readonly path = '/';
  readonly heading: Locator;
  readonly lowStockLink: Locator;
  readonly productsCount: Locator;
  readonly activeCount: Locator;
  readonly lowStockCount: Locator;
  readonly categoriesCount: Locator;
  readonly suppliersCount: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 1 });
    this.lowStockLink = page.getByRole('link', { name: 'See all low-stock products' });
    // The number on each count card. The cards have no role or label of their own, so they carry
    // test IDs such as stat-products.
    const count = (name: string) => page.getByTestId(`stat-${name}`).getByText(/^\d+$/);
    this.productsCount = count('products');
    this.activeCount = count('active');
    this.lowStockCount = count('low-stock');
    this.categoriesCount = count('categories');
    this.suppliersCount = count('suppliers');
  }
}
