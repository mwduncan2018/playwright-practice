import type { Locator, Page } from '@playwright/test';

/** What every Super Portal page has: the menu and the messages that pop up. */
export class PortalLayout {
  /** The menu at the top. Its user menu button is named after the signed-in user. */
  readonly menu: Locator;
  readonly settingsItem: Locator;
  readonly signOutItem: Locator;
  /** Messages on the page, such as "Comment posted.". Narrow them with filter({ hasText }). */
  readonly alerts: Locator;

  constructor(page: Page) {
    this.menu = page.getByRole('navigation', { name: 'Main' });
    this.settingsItem = this.menu.getByRole('link', { name: 'Settings', exact: true });
    this.signOutItem = this.menu.getByRole('button', { name: 'Sign out' });
    this.alerts = page.getByRole('alert');
  }
}
