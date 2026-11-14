import type { Locator, Page } from '@playwright/test';

/** What every Super Portal page has: the menu, the user menu, and messages that pop up. */
export class PortalLayout {
  readonly menu: Locator;
  readonly settingsItem: Locator;
  readonly signOutItem: Locator;

  constructor(readonly page: Page) {
    this.menu = page.getByRole('navigation', { name: 'Main' });
    this.settingsItem = this.menu.getByRole('link', { name: 'Settings', exact: true });
    this.signOutItem = this.menu.getByRole('button', { name: 'Sign out' });
  }

  /** A link in the menu, such as "My requests" or "Approvals". */
  menuLink(name: string): Locator {
    return this.menu.getByRole('link', { name, exact: true });
  }

  /** The user menu, which shows the signed-in user's name. */
  userMenu(userName: string): Locator {
    return this.menu.getByRole('button', { name: userName });
  }

  /** A message on the page, such as "Comment posted." or an explanation on a request. */
  message(text: string): Locator {
    return this.page.getByRole('alert').filter({ hasText: text });
  }

  async openSettings(userName: string): Promise<void> {
    await this.userMenu(userName).click();
    await this.settingsItem.click();
  }
}
