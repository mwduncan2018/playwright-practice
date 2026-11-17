import { test, type Locator, type Page } from '@playwright/test';

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

  async fillSecret(secretInput: Locator, secret: string): Promise<void> {
    await secretInput.click();
    await secretInput.evaluate((inputElement: HTMLInputElement, secretValue) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(inputElement, secretValue);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }, secret);
  }
}
