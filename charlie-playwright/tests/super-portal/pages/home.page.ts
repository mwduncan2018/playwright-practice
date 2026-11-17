import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class HomePage extends BasePage {
  readonly path = '/';
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Home', level: 1 });
  }
}
