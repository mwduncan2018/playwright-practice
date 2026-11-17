import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class NewRequestPage extends BasePage {
  readonly path = '/catalog';
  readonly requestEquipmentButton: Locator;
  readonly requestSoftwareButton: Locator;
  readonly requestAccessButton: Locator;

  constructor(page: Page) {
    super(page);
    this.requestEquipmentButton = page.getByRole('button', { name: 'Request equipment' });
    this.requestSoftwareButton = page.getByRole('button', { name: 'Request software' });
    this.requestAccessButton = page.getByRole('button', { name: 'Request access' });
  }
}
