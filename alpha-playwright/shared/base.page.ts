import { test, type Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getTabTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string): Promise<void> {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await test.info().attach(name, { body: screenshot, contentType: 'image/png' });
  }
}
