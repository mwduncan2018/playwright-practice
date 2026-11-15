import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

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
