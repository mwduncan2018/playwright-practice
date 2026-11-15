import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class CategoryDialog extends BasePage {
  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly saveButton: Locator;

  constructor(page: Page, title: string | RegExp) {
    super(page);
    this.dialog = page.getByRole('dialog', { name: title });
    this.nameInput = this.dialog.getByLabel('Name');
    this.descriptionTextarea = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
  }
}
