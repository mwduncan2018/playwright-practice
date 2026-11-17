import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class NavbarPage extends BasePage {
  readonly navigationBar: Locator;
  readonly dashboardLink: Locator;
  readonly productsLink: Locator;
  readonly categoriesLink: Locator;
  readonly suppliersLink: Locator;
  readonly activityLogLink: Locator;
  readonly userMenuButton: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigationBar = page.getByRole('navigation', { name: 'Main' });
    this.dashboardLink = this.navigationBar.getByRole('link', { name: 'Dashboard', exact: true });
    this.productsLink = this.navigationBar.getByRole('link', { name: 'Products', exact: true });
    this.categoriesLink = this.navigationBar.getByRole('link', { name: 'Categories', exact: true });
    this.suppliersLink = this.navigationBar.getByRole('link', { name: 'Suppliers', exact: true });
    this.activityLogLink = this.navigationBar.getByRole('link', { name: 'Activity log', exact: true });
    this.userMenuButton = this.navigationBar.locator('#user-menu');
    this.signOutButton = this.navigationBar.getByRole('button', { name: 'Sign out' });
  }
}
