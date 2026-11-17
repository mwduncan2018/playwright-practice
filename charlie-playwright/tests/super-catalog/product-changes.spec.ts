import { expect, plan, test } from './fixtures';
import { newTestProduct, PRODUCT_IMAGE } from './test-data';

test('SC-006 Product form validation', { tag: '@regression', annotation: plan('SC-006') }, async ({ adminUser }) => {
  await test.step('1. Open the New product form and select Create product without entering anything.', async () => {
    await adminUser.page.goto(adminUser.productFormPage.path);
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productFormPage.skuInput, 'SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."').toHaveAccessibleErrorMessage('Enter a SKU like ABC-1234: three capital letters, a dash and four digits.');
    await expect(adminUser.productFormPage.nameInput, 'Name says "Enter a name."').toHaveAccessibleErrorMessage('Enter a name.');
    await expect(adminUser.productFormPage.categorySelect, 'Category says "Choose a category."').toHaveAccessibleErrorMessage('Choose a category.');
    await expect(adminUser.productFormPage.priceInput, 'Price (USD) says "Enter a price greater than 0 and no more than 100,000."').toHaveAccessibleErrorMessage('Enter a price greater than 0 and no more than 100,000.');
  });

  await test.step('2. Enter the duplicate SKU and the other test data, then select Create product.', async () => {
    await adminUser.productFormPage.skuInput.fill('ELE-1001');
    await adminUser.productFormPage.nameInput.fill('Test product with a duplicate SKU');
    await adminUser.productFormPage.categorySelect.selectOption('Home & Kitchen');
    await adminUser.productFormPage.priceInput.fill('10.00');
    await adminUser.productFormPage.stockInput.fill('0');
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productFormPage.skuInput, 'SKU says "Another product already uses SKU ELE-1001."').toHaveAccessibleErrorMessage('Another product already uses SKU ELE-1001.');
    await expect(adminUser.productFormPage.newProductHeading, 'The New product form is still open.').toBeVisible();
  });

  await test.step('3. Enter the bad stock and select Create product.', async () => {
    await adminUser.productFormPage.stockInput.fill('-1');
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productFormPage.stockInput, 'Stock says "Enter a whole number, 0 or more."').toHaveAccessibleErrorMessage('Enter a whole number, 0 or more.');
  });
});

test('SC-007 Edit a product and add an image', { tag: '@regression', annotation: plan('SC-007') }, async ({ adminUser }) => {
  const testProduct = newTestProduct();

  await test.step('1. Create a product with the test data.', async () => {
    await adminUser.page.goto(adminUser.productFormPage.path);
    await adminUser.productFormPage.skuInput.fill(testProduct.sku);
    await adminUser.productFormPage.nameInput.fill(testProduct.name);
    await adminUser.productFormPage.categorySelect.selectOption(testProduct.category);
    await adminUser.productFormPage.supplierSelect.selectOption(testProduct.supplier);
    await adminUser.productFormPage.priceInput.fill(testProduct.price);
    await adminUser.productFormPage.stockInput.fill(testProduct.stock);
    await adminUser.productFormPage.draftStatusRadio.check();
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productPage.heading, "The product's page opens.").toHaveText(testProduct.name);
  });

  await test.step('2. Select Edit, enter the new price and stock, choose the image, and select Save changes.', async () => {
    await adminUser.productPage.editLink.click();
    await adminUser.productFormPage.priceInput.fill('24.50');
    await adminUser.productFormPage.stockInput.fill('3');
    await adminUser.productFormPage.imageInput.setInputFiles(PRODUCT_IMAGE);
    await adminUser.productFormPage.saveButton.click();
    await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Saved changes to <SKU> <name>." appears.').toContainText(`Saved changes to ${testProduct.sku} ${testProduct.name}.`);
    await expect(adminUser.productPage.priceValue, "The product's page shows price $24.50 and stock 3 with a Low stock badge.").toHaveText('$24.50');
    await expect(adminUser.productPage.stockValue, "The product's page shows price $24.50 and stock 3 with a Low stock badge.").toHaveText(/^3\s*Low stock$/);
    await expect(adminUser.productPage.photoImage, "The product's photo is shown.").toBeVisible();
  });

  await test.step('3. Open the Activity log and choose Product in Type.', async () => {
    await adminUser.navbarPage.activityLogLink.click();
    await adminUser.activityLogPage.typeSelect.selectOption('Product');
    await expect(adminUser.activityLogPage.updatedEntryRows(`${testProduct.sku} ${testProduct.name}`), 'An Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3".').toContainText(['Price: 19.99 → 24.50; Stock: 25 → 3']);
  });
});

test('SC-008 Delete a product', { tag: '@regression', annotation: plan('SC-008') }, async ({ adminUser }) => {
  const testProduct = newTestProduct();

  await test.step('1. Create a product with the test data.', async () => {
    await adminUser.page.goto(adminUser.productFormPage.path);
    await adminUser.productFormPage.skuInput.fill(testProduct.sku);
    await adminUser.productFormPage.nameInput.fill(testProduct.name);
    await adminUser.productFormPage.categorySelect.selectOption(testProduct.category);
    await adminUser.productFormPage.supplierSelect.selectOption(testProduct.supplier);
    await adminUser.productFormPage.priceInput.fill(testProduct.price);
    await adminUser.productFormPage.stockInput.fill(testProduct.stock);
    await adminUser.productFormPage.draftStatusRadio.check();
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productPage.heading, "The product's page opens.").toHaveText(testProduct.name);
  });

  await test.step('2. Select Delete.', async () => {
    await adminUser.productPage.deleteButton.click();
    await expect(adminUser.deleteProductDialog.dialog, 'A Delete product dialog asks "Delete <SKU> <name>? This can\'t be undone."').toContainText(`Delete ${testProduct.sku} ${testProduct.name}? This can't be undone.`);
  });

  await test.step('3. Select Cancel.', async () => {
    await adminUser.deleteProductDialog.cancelButton.click();
    await expect(adminUser.deleteProductDialog.dialog, "The dialog closes, and the product's page is still shown.").toBeHidden();
    await expect(adminUser.productPage.heading, "The dialog closes, and the product's page is still shown.").toHaveText(testProduct.name);
  });

  await test.step('4. Select Delete, then select Delete in the dialog.', async () => {
    await adminUser.productPage.deleteButton.click();
    await adminUser.deleteProductDialog.confirmButton.click();
    await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Deleted <SKU> <name>." appears.').toContainText(`Deleted ${testProduct.sku} ${testProduct.name}.`);
    await expect(adminUser.productsPage.heading, 'The Products page opens.').toBeVisible();
  });

  await test.step('5. Search the Products page for the SKU.', async () => {
    await adminUser.productsPage.searchInput.fill(testProduct.sku);
    await expect(adminUser.productsPage.summaryText, 'The page says "No products match these filters."').toHaveText('No products match these filters.');
  });
});
