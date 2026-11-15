import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The New category dialog, or the Edit dialog, which is titled with the category's name before the
 * change, such as "Edit Electronics". Only one is open at a time, so a pattern such as /^Edit / matches
 * whichever category's Edit dialog is open.
 */
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
