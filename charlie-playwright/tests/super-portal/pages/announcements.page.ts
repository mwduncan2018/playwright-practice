import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class AnnouncementsPage extends BasePage {
  readonly newAnnouncementButton: Locator;
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
