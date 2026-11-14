import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/** The New request page, where each request type's button opens its wizard. */
export class NewRequestPage extends BasePage {
  readonly path = '/catalog';
  readonly requestEquipment: Locator;
  readonly requestSoftware: Locator;
  readonly requestAccess: Locator;

  constructor(page: Page) {
    super(page);
    this.requestEquipment = page.getByRole('button', { name: 'Request equipment' });
    this.requestSoftware = page.getByRole('button', { name: 'Request software' });
    this.requestAccess = page.getByRole('button', { name: 'Request access' });
  }
}
