import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The list of announcements. */
export class AnnouncementsPage extends BasePage {
  readonly path = '/announcements';
  readonly newAnnouncementButton: Locator;
  /** "6 announcements" */
  readonly summaryText: Locator;
  readonly announcementsList: Locator;

  constructor(page: Page) {
    super(page);
    this.newAnnouncementButton = page.getByRole('button', { name: 'New announcement' });
    this.summaryText = page.getByRole('status').filter({ hasText: /announcements?$/ });
    this.announcementsList = page.getByRole('list', { name: 'Announcements' });
  }

  announcementLink(title: string): Locator {
    return this.announcementsList.getByRole('link', { name: title, exact: true });
  }
}
