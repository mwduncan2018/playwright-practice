import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export type DashboardCount = 'products' | 'active' | 'low-stock' | 'categories' | 'suppliers';

export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly lowStockLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard', level: 1 });
    this.lowStockLink = page.getByRole('link', { name: 'See all low-stock products' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  welcome(userName: string): Locator {
    return this.page.getByText(`Welcome, ${userName}.`);
  }

  /** The number on a count card. The cards have no role or label of their own, so they carry test IDs. */
  count(name: DashboardCount): Locator {
    return this.page.getByTestId(`stat-${name}`).getByText(/^\d+$/);
  }
}
