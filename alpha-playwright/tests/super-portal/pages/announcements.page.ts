import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

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

/** One announcement's page. */
export class AnnouncementPage extends BasePage {
  /** "Posted ..." or "Scheduled for ...", with the author. */
  readonly meta: Locator;
  readonly audience: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.meta = page.getByTestId('announcement-meta');
    this.audience = page.getByTestId('announcement-audience');
    this.deleteButton = page.getByRole('main').getByRole('button', { name: 'Delete', exact: true });
  }
}
