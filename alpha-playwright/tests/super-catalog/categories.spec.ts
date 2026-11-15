import { uniqueSuffix } from '../../shared/test-data';
import { expect, plan, test } from './fixtures';

test('SC-009 Add, rename and delete a category', { tag: '@regression', annotation: plan('SC-009') }, async ({ adminUser }) => {
  const categoryName = `Test category ${uniqueSuffix()}`;
  const newCategoryName = `${categoryName} (renamed)`;

  await test.step('1. Open Categories and select New category.', async () => {
    await adminUser.page.goto(adminUser.categoriesPage.path);
    await adminUser.categoriesPage.newCategoryButton.click();
    await expect(adminUser.newCategoryDialog.dialog, 'The New category dialog opens.').toBeVisible();
  });

  await test.step('2. Enter the name and select Save.', async () => {
    await adminUser.newCategoryDialog.nameInput.fill(categoryName);
    await adminUser.newCategoryDialog.saveButton.click();
    await expect(adminUser.alertsPage.alertMessages.filter({ hasText: `Created the ${categoryName} category.` }), 'The message "Created the <name> category." appears.').toBeVisible();
    await expect(adminUser.categoriesPage.productCountLink(categoryName), 'The category is listed with 0 products.').toHaveText('0');
  });

  await test.step('3. Select Edit for the category, enter the existing name, and select Save.', async () => {
    await adminUser.categoriesPage.editButton(categoryName).click();
    await adminUser.editCategoryDialog.nameInput.fill('Electronics');
    await adminUser.editCategoryDialog.saveButton.click();
    await expect(adminUser.editCategoryDialog.dialog, 'The dialog says "A category named Electronics already exists."').toContainText('A category named Electronics already exists.');
  });

  await test.step('4. Enter the new name and select Save.', async () => {
    await adminUser.editCategoryDialog.nameInput.fill(newCategoryName);
    await adminUser.editCategoryDialog.saveButton.click();
    await expect(adminUser.categoriesPage.categoryRow(newCategoryName), 'The category is listed under its new name.').toBeVisible();
  });

  await test.step('5. Select Delete for Electronics, then select Delete in the dialog.', async () => {
    await adminUser.categoriesPage.deleteButton('Electronics').click();
    await adminUser.deleteCategoryDialog.confirmButton.click();
    await expect(adminUser.deleteCategoryDialog.problemAlert, 'The dialog says "Electronics has 10 products, so it can\'t be deleted. Move or delete them first."').toHaveText("Electronics has 10 products, so it can't be deleted. Move or delete them first.");
  });

  await test.step('6. Select OK, then select Delete for the renamed category and Delete in the dialog.', async () => {
    await adminUser.deleteCategoryDialog.okButton.click();
    await adminUser.categoriesPage.deleteButton(newCategoryName).click();
    await adminUser.deleteCategoryDialog.confirmButton.click();
    await expect(adminUser.alertsPage.alertMessages.filter({ hasText: `Deleted the ${newCategoryName} category.` }), 'The message "Deleted the <new name> category." appears.').toBeVisible();
    await expect(adminUser.categoriesPage.categoryRow(newCategoryName), 'The category is no longer listed.').toHaveCount(0);
  });
});
