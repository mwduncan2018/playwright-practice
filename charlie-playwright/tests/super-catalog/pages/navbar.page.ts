import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class NavbarPage extends BasePage {
  readonly navigationBar: Locator;
  readonly activityLogLink: Locator;
  readonly userMenuButton: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigationBar = page.getByRole('navigation', { name: 'Main' });
    this.activityLogLink = this.navigationBar.getByRole('link', { name: 'Activity log', exact: true });
    this.userMenuButton = this.navigationBar.locator('#user-menu');
    this.signOutButton = this.navigationBar.getByRole('button', { name: 'Sign out' });
  }
}
