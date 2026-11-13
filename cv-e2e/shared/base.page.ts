import { test, type Page } from '@playwright/test';

/** What every page object has. Page objects extend this; it can't be used on its own. */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * The address the browser is on right now. It reads the address once, without waiting, so to
   * check where a test ended up, use `await expect(page).toHaveURL(...)`, which waits for it.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Takes a full-page screenshot and adds it to the running test's report under the given name. */
  async takeScreenshot(name: string): Promise<void> {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await test.info().attach(name, { body: screenshot, contentType: 'image/png' });
  }
}
