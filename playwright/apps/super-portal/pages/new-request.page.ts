import type { Locator, Page } from '@playwright/test';

/** The New request page, where each request type's button opens its wizard. */
export class NewRequestPage {
  readonly requestEquipment: Locator;
  readonly requestSoftware: Locator;
  readonly requestAccess: Locator;

  constructor(readonly page: Page) {
    this.requestEquipment = page.getByRole('button', { name: 'Request equipment' });
    this.requestSoftware = page.getByRole('button', { name: 'Request software' });
    this.requestAccess = page.getByRole('button', { name: 'Request access' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/catalog');
  }
}
