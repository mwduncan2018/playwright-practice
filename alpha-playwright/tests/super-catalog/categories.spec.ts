import { uniqueSuffix } from '../../shared/test-data';
import { expect, plan, test } from './fixtures';

test('SC-009 Add, rename and delete a category', { tag: '@regression', annotation: plan('SC-009') }, async ({ admin }) => {
  const name = `Test category ${uniqueSuffix()}`;
  const newName = `${name} (renamed)`;

  await test.step('1. Open Categories and select New category.', async () => {
    await admin.page.goto(admin.categories.path);
    await admin.categories.newCategoryButton.click();
    await expect(admin.newCategoryDialog.dialog, 'The New category dialog opens.').toBeVisible();
  });

  await test.step('2. Enter the name and select Save.', async () => {
    await admin.newCategoryDialog.name.fill(name);
    await admin.newCategoryDialog.saveButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Created the ${name} category.` }),
      'The message "Created the <name> category." appears.',
    ).toBeVisible();
    await expect(admin.categories.productCount(name), 'The category is listed with 0 products.').toHaveText('0');
  });

  await test.step('3. Select Edit for the category, enter the existing name, and select Save.', async () => {
    await admin.categories.editButton(name).click();
    await admin.editCategoryDialog.name.fill('Electronics');
    await admin.editCategoryDialog.saveButton.click();
    await expect(
      admin.editCategoryDialog.dialog,
      'The dialog says "A category named Electronics already exists."',
    ).toContainText('A category named Electronics already exists.');
  });

  await test.step('4. Enter the new name and select Save.', async () => {
    await admin.editCategoryDialog.name.fill(newName);
    await admin.editCategoryDialog.saveButton.click();
    await expect(admin.categories.row(newName), 'The category is listed under its new name.').toBeVisible();
  });

  await test.step('5. Select Delete for Electronics, then select Delete in the dialog.', async () => {
    await admin.categories.deleteButton('Electronics').click();
    await admin.deleteCategoryDialog.confirmButton.click();
    await expect(
      admin.deleteCategoryDialog.problem,
      'The dialog says "Electronics has 10 products, so it can\'t be deleted. Move or delete them first."',
    ).toHaveText("Electronics has 10 products, so it can't be deleted. Move or delete them first.");
  });

  await test.step('6. Select OK, then select Delete for the renamed category and Delete in the dialog.', async () => {
    await admin.deleteCategoryDialog.okButton.click();
    await admin.categories.deleteButton(newName).click();
    await admin.deleteCategoryDialog.confirmButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Deleted the ${newName} category.` }),
      'The message "Deleted the <new name> category." appears.',
    ).toBeVisible();
    await expect(admin.categories.row(newName), 'The category is no longer listed.').toHaveCount(0);
  });
});
