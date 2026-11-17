import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class AnnouncementPage extends BasePage {
  readonly bylineText: Locator;
  readonly audienceBadge: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    super(page);
    this.bylineText = page.getByTestId('announcement-meta');
    this.audienceBadge = page.getByTestId('announcement-audience');
    this.deleteButton = page.getByRole('main').getByRole('button', { name: 'Delete', exact: true });
  }
}
