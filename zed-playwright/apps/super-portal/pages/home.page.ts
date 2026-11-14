import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Home', level: 1 });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
