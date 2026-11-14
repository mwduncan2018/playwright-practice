import { uniqueSuffix } from '../../shared/test-data';
import { expect, plan, test } from './fixtures';

test.use({ signedInAs: 'admin' });

test(
  'SC-009 Add, rename and delete a category',
  { tag: '@regression', annotation: plan('SC-009') },
  async ({ catalog }) => {
    const { categories } = catalog;
    const name = `Test category ${uniqueSuffix()}`;
    const newName = `${name} (renamed)`;

    await test.step('1. Open Categories and select New category.', async () => {
      await categories.goto();
      await categories.newCategoryButton.click();
      await expect(categories.newCategoryDialog.dialog, 'The New category dialog opens.').toBeVisible();
    });

    await test.step('2. Enter the name and select Save.', async () => {
      await categories.newCategoryDialog.name.fill(name);
      await categories.newCategoryDialog.saveButton.click();
      await expect(
        catalog.layout.message(`Created the ${name} category.`),
        'The message "Created the <name> category." appears.',
      ).toBeVisible();
      await expect(categories.productCount(name), 'The category is listed with 0 products.').toHaveText('0');
    });

    await test.step('3. Select Edit for the category, enter the existing name, and select Save.', async () => {
      await categories.editButton(name).click();
      const dialog = categories.editDialog(name);
      await dialog.name.fill('Electronics');
      await dialog.saveButton.click();
      await expect(dialog.dialog, 'The dialog says "A category named Electronics already exists."').toContainText(
        'A category named Electronics already exists.',
      );
    });

    await test.step('4. Enter the new name and select Save.', async () => {
      const dialog = categories.editDialog(name);
      await dialog.name.fill(newName);
      await dialog.saveButton.click();
      await expect(categories.row(newName), 'The category is listed under its new name.').toBeVisible();
    });

    await test.step('5. Select Delete for Electronics, then select Delete in the dialog.', async () => {
      await categories.deleteButton('Electronics').click();
      await categories.deleteDialog.confirmButton.click();
      await expect(
        categories.deleteDialog.problem,
        'The dialog says "Electronics has 10 products, so it can\'t be deleted. Move or delete them first."',
      ).toHaveText("Electronics has 10 products, so it can't be deleted. Move or delete them first.");
    });

    await test.step('6. Select OK, then select Delete for the renamed category and Delete in the dialog.', async () => {
      await categories.deleteDialog.okButton.click();
      await categories.deleteButton(newName).click();
      await categories.deleteDialog.confirmButton.click();
      await expect(
        catalog.layout.message(`Deleted the ${newName} category.`),
        'The message "Deleted the <new name> category." appears.',
      ).toBeVisible();
      await expect(categories.row(newName), 'The category is no longer listed.').toHaveCount(0);
    });
  },
);
