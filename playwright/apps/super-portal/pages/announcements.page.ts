import type { Locator, Page } from '@playwright/test';

import { AnnouncementWizard } from './announcement-wizard';
import { ConfirmDialog } from './dialogs';

export class AnnouncementsPage {
  readonly newAnnouncementButton: Locator;
  /** "6 announcements" */
  readonly summary: Locator;
  readonly list: Locator;
  readonly wizard: AnnouncementWizard;

  constructor(readonly page: Page) {
    this.newAnnouncementButton = page.getByRole('button', { name: 'New announcement' });
    this.summary = page.getByRole('status').filter({ hasText: /announcements?$/ });
    this.list = page.getByRole('list', { name: 'Announcements' });
    this.wizard = new AnnouncementWizard(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/announcements');
  }

  announcementLink(title: string): Locator {
    return this.list.getByRole('link', { name: title, exact: true });
  }
}

/** One announcement's page. */
export class AnnouncementPage {
  /** "Posted ..." or "Scheduled for ...", with the author. */
  readonly meta: Locator;
  readonly audience: Locator;
  readonly deleteButton: Locator;
  readonly deleteDialog: ConfirmDialog;

  constructor(readonly page: Page) {
    this.meta = page.getByTestId('announcement-meta');
    this.audience = page.getByTestId('announcement-audience');
    this.deleteButton = page.getByRole('main').getByRole('button', { name: 'Delete', exact: true });
    this.deleteDialog = new ConfirmDialog(page, 'Delete announcement');
  }

  heading(title: string): Locator {
    return this.page.getByRole('heading', { name: title, level: 1 });
  }
}
