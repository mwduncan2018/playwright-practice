import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class NavbarPage extends BasePage {
  readonly navigationBar: Locator;
  readonly homeLink: Locator;
  readonly newRequestLink: Locator;
  readonly myRequestsLink: Locator;
  readonly approvalsLink: Locator;
  readonly allRequestsLink: Locator;
  readonly reportsLink: Locator;
  readonly announcementsLink: Locator;
  readonly peopleLink: Locator;
  readonly userMenuButton: Locator;
  readonly settingsLink: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.navigationBar = page.getByRole('navigation', { name: 'Main' });
    this.homeLink = this.navigationBar.getByRole('link', { name: 'Home', exact: true });
    this.newRequestLink = this.navigationBar.getByRole('link', { name: 'New request', exact: true });
    this.myRequestsLink = this.navigationBar.getByRole('link', { name: 'My requests', exact: true });
    this.approvalsLink = this.navigationBar.getByRole('link', { name: 'Approvals', exact: true });
    this.allRequestsLink = this.navigationBar.getByRole('link', { name: 'All requests', exact: true });
    this.reportsLink = this.navigationBar.getByRole('link', { name: 'Reports', exact: true });
    this.announcementsLink = this.navigationBar.getByRole('link', { name: 'Announcements', exact: true });
    this.peopleLink = this.navigationBar.getByRole('link', { name: 'People', exact: true });
    this.userMenuButton = this.navigationBar.locator('#user-menu');
    this.settingsLink = this.navigationBar.getByRole('link', { name: 'Settings', exact: true });
    this.signOutButton = this.navigationBar.getByRole('button', { name: 'Sign out' });
  }
}
