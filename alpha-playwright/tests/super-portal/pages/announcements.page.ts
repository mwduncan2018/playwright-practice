import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';
import { AnnouncementWizard } from './announcement-wizard';
import { ConfirmDialog } from './dialogs';

export class AnnouncementsPage extends BasePage {
  readonly newAnnouncementButton: Locator;
  /** "6 announcements" */
  readonly summary: Locator;
  readonly list: Locator;
  readonly wizard: AnnouncementWizard;

  constructor(page: Page) {
    super(page);
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
export class AnnouncementPage extends BasePage {
  /** "Posted ..." or "Scheduled for ...", with the author. */
  readonly meta: Locator;
  readonly audience: Locator;
  readonly deleteButton: Locator;
  readonly deleteDialog: ConfirmDialog;

  constructor(page: Page) {
    super(page);
    this.meta = page.getByTestId('announcement-meta');
    this.audience = page.getByTestId('announcement-audience');
    this.deleteButton = page.getByRole('main').getByRole('button', { name: 'Delete', exact: true });
    this.deleteDialog = new ConfirmDialog(page, 'Delete announcement');
  }

  heading(title: string): Locator {
    return this.page.getByRole('heading', { name: title, level: 1 });
  }
}
