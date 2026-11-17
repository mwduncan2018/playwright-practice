import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class NavbarPage extends BasePage {
  readonly navigationBar: Locator;
  readonly allRequestsLink: Locator;
  readonly userMenuButton: Locator;
  readonly settingsLink: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigationBar = page.getByRole('navigation', { name: 'Main' });
    this.allRequestsLink = this.navigationBar.getByRole('link', { name: 'All requests', exact: true });
    this.userMenuButton = this.navigationBar.locator('#user-menu');
    this.settingsLink = this.navigationBar.getByRole('link', { name: 'Settings', exact: true });
    this.signOutButton = this.navigationBar.getByRole('button', { name: 'Sign out' });
  }
}
