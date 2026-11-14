import type { Locator, Page } from '@playwright/test';

/** What every Super Catalog page has: the menu, the user menu, and messages that pop up. */
export class CatalogLayout {
  readonly menu: Locator;
  readonly signOutItem: Locator;

  constructor(readonly page: Page) {
    this.menu = page.getByRole('navigation', { name: 'Main' });
    this.signOutItem = this.menu.getByRole('button', { name: 'Sign out' });
  }

  /** A link in the menu, such as "Products" or "Activity log". */
  menuLink(name: string): Locator {
    return this.menu.getByRole('link', { name, exact: true });
  }

  /** The user menu, which shows the signed-in user's name. */
  userMenu(userName: string): Locator {
    return this.menu.getByRole('button', { name: userName });
  }

  /** A message on the page, such as the "Created ..." note that pops up after saving. */
  message(text: string): Locator {
    return this.page.getByRole('alert').filter({ hasText: text });
  }

  async signOut(userName: string): Promise<void> {
    await this.userMenu(userName).click();
    await this.signOutItem.click();
  }
}
