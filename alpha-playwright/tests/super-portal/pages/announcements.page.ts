import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The list of announcements. */
export class AnnouncementsPage extends BasePage {
  readonly path = '/announcements';
  readonly newAnnouncementButton: Locator;
  /** "6 announcements" */
  readonly summary: Locator;
  readonly list: Locator;

  constructor(page: Page) {
    super(page);
    this.newAnnouncementButton = page.getByRole('button', { name: 'New announcement' });
    this.summary = page.getByRole('status').filter({ hasText: /announcements?$/ });
    this.list = page.getByRole('list', { name: 'Announcements' });
  }

  announcementLink(title: string): Locator {
    return this.list.getByRole('link', { name: title, exact: true });
  }
}
