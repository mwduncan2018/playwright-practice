import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The navigation bar at the top of every Super Portal page: the links on the left and, at the upper
 * right, the user menu with Settings and Sign out. The user menu's button is named after the
 * signed-in user, so tests find it with navigationBar.getByRole('button', { name: <user's name> }).
 */
export class NavbarPage extends BasePage {
  /** The whole bar, the navigation named "Main". */
  readonly navigationBar: Locator;
  readonly settingsLink: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigationBar = page.getByRole('navigation', { name: 'Main' });
    this.settingsLink = this.navigationBar.getByRole('link', { name: 'Settings', exact: true });
    this.signOutButton = this.navigationBar.getByRole('button', { name: 'Sign out' });
  }
}
