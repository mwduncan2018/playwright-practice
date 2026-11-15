import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The navigation bar at the top of every Super Catalog page: the links on the left and, at the upper
 * right, the user menu with Sign out.
 */
export class NavbarPage extends BasePage {
  /** The whole bar, the navigation named "Main". */
  readonly navigationBar: Locator;
  /** The Activity log link, which only admins see. */
  readonly activityLogLink: Locator;
  /**
   * The button at the upper right that opens the user menu. It shows the signed-in user's name, so
   * it's found by its id, which is the same for every user.
   */
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
