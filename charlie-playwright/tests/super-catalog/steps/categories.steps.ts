import { expect, Then, When } from '../fixtures';

When('the admin user opens Categories and selects New category', async ({ adminUser }) => {
  await adminUser.page.goto(adminUser.categoriesPage.path);
  await adminUser.categoriesPage.newCategoryButton.click();
});

Then('the admin user sees that the New category dialog opens', async ({ adminUser }) => {
  await expect(adminUser.newCategoryDialog.dialog, 'The New category dialog opens.').toBeVisible();
});

When('the admin user enters the name and selects Save', async ({ adminUser, testCategory }) => {
  await adminUser.newCategoryDialog.nameInput.fill(testCategory.name);
  await adminUser.newCategoryDialog.saveButton.click();
});

Then('the admin user sees that the message "Created the <name> category." appears', async ({ adminUser, testCategory }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Created the <name> category." appears.').toContainText(`Created the ${testCategory.name} category.`);
});

Then('the admin user sees that the category is listed with 0 products', async ({ adminUser, testCategory }) => {
  await expect(adminUser.categoriesPage.productCountLink(testCategory.name), 'The category is listed with 0 products.').toHaveText('0');
});

When('the admin user selects Edit for the category, enters the existing name, and selects Save', async ({ adminUser, testCategory }) => {
  await adminUser.categoriesPage.editButton(testCategory.name).click();
  await adminUser.editCategoryDialog.nameInput.fill('Electronics');
  await adminUser.editCategoryDialog.saveButton.click();
});

Then('the admin user sees that the dialog says "A category named Electronics already exists."', async ({ adminUser }) => {
  await expect(adminUser.editCategoryDialog.dialog, 'The dialog says "A category named Electronics already exists."').toContainText('A category named Electronics already exists.');
});

When('the admin user enters the new name and selects Save', async ({ adminUser, testCategory }) => {
  await adminUser.editCategoryDialog.nameInput.fill(testCategory.newName);
  await adminUser.editCategoryDialog.saveButton.click();
});

Then('the admin user sees that the category is listed under its new name', async ({ adminUser, testCategory }) => {
  await expect(adminUser.categoriesPage.categoryRow(testCategory.newName), 'The category is listed under its new name.').toBeVisible();
});

When('the admin user selects Delete for Electronics, then selects Delete in the dialog', async ({ adminUser }) => {
  await adminUser.categoriesPage.deleteButton('Electronics').click();
  await adminUser.deleteCategoryDialog.confirmButton.click();
});

Then('the admin user sees that the dialog says "Electronics has 10 products, so it can\'t be deleted. Move or delete them first."', async ({ adminUser }) => {
  await expect(adminUser.deleteCategoryDialog.problemAlert, 'The dialog says "Electronics has 10 products, so it can\'t be deleted. Move or delete them first."').toHaveText("Electronics has 10 products, so it can't be deleted. Move or delete them first.");
});

When('the admin user selects OK, then selects Delete for the renamed category and Delete in the dialog', async ({ adminUser, testCategory }) => {
  await adminUser.deleteCategoryDialog.okButton.click();
  await adminUser.categoriesPage.deleteButton(testCategory.newName).click();
  await adminUser.deleteCategoryDialog.confirmButton.click();
});

Then('the admin user sees that the message "Deleted the <new name> category." appears', async ({ adminUser, testCategory }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Deleted the <new name> category." appears.').toContainText(`Deleted the ${testCategory.newName} category.`);
});

Then('the admin user sees that the category is no longer listed', async ({ adminUser, testCategory }) => {
  await expect(adminUser.categoriesPage.categoryRow(testCategory.newName), 'The category is no longer listed.').toHaveCount(0);
});
