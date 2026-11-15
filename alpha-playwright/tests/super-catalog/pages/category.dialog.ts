import type { Locator, Page } from '@playwright/test';

/**
 * The New category dialog, or the Edit dialog, which is titled with the category's name before the
 * change, such as "Edit Electronics". Only one is open at a time, so a pattern such as /^Edit / matches
 * whichever category's Edit dialog is open.
 */
export class CategoryDialog {
  readonly dialog: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly saveButton: Locator;

  constructor(page: Page, title: string | RegExp) {
    this.dialog = page.getByRole('dialog', { name: title });
    this.name = this.dialog.getByLabel('Name');
    this.description = this.dialog.getByLabel('Description');
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
  }
}
