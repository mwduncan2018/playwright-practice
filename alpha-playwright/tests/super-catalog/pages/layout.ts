import type { Locator, Page } from '@playwright/test';

/** What every Super Catalog page has: the menu and the messages that pop up. */
export class CatalogLayout {
  /** The menu at the top. Its user menu button is named after the signed-in user. */
  readonly menu: Locator;
  /** The Activity log link, which only admins see. */
  readonly activityLogLink: Locator;
  readonly signOutItem: Locator;
  /** Messages that pop up, such as "Created ..." after saving. Narrow them with filter({ hasText }). */
  readonly alerts: Locator;

  constructor(page: Page) {
    this.menu = page.getByRole('navigation', { name: 'Main' });
    this.activityLogLink = this.menu.getByRole('link', { name: 'Activity log', exact: true });
    this.signOutItem = this.menu.getByRole('button', { name: 'Sign out' });
    this.alerts = page.getByRole('alert');
  }
}
