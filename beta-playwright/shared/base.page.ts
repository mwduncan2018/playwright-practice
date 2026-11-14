import { test, type Page } from '@playwright/test';

/** What every page object has. Page objects extend this; it can't be used on its own. */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Returns the page's address at this moment, without waiting for it to change.
   * To check where a click or other action led, use `await expect(page).toHaveURL(...)` instead:
   * it keeps checking until the address matches.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Returns the browser tab's title at this moment, without waiting for it to change.
   * To check the title, use `await expect(page).toHaveTitle(...)` instead: it keeps checking until
   * the title matches.
   */
  async getTabTitle(): Promise<string> {
    return this.page.title();
  }

  /** Takes a full-page screenshot and adds it to the running test's report under the given name. */
  async takeScreenshot(name: string): Promise<void> {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await test.info().attach(name, { body: screenshot, contentType: 'image/png' });
  }
}
