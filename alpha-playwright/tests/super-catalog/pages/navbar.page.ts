import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The navigation bar at the top of every Super Catalog page: the links on the left and, at the upper
 * right, the user menu with Sign out. The user menu's button is named after the signed-in user, so
 * tests find it with menu.getByRole('button', { name: <user's name> }).
 */
export class NavbarPage extends BasePage {
  /** The whole bar, the navigation named "Main". */
  readonly menu: Locator;
  /** The Activity log link, which only admins see. */
  readonly activityLogLink: Locator;
  readonly signOutItem: Locator;

  constructor(page: Page) {
    super(page);
    this.menu = page.getByRole('navigation', { name: 'Main' });
    this.activityLogLink = this.menu.getByRole('link', { name: 'Activity log', exact: true });
    this.signOutItem = this.menu.getByRole('button', { name: 'Sign out' });
  }
}
