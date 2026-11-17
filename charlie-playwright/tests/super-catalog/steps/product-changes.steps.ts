import { expect, Then, When } from '../fixtures';
import { PRODUCT_IMAGE } from '../test-data';

When('the admin user opens the Products page and selects New product', async ({ adminUser }) => {
  await adminUser.page.goto(adminUser.productsPage.path);
  await adminUser.productsPage.newProductLink.click();
});

Then('the admin user sees that the New product form opens', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.newProductHeading, 'The New product form opens.').toBeVisible();
});

When('the admin user fills in the form with the test data and selects Create product', async ({ adminUser, testProduct }) => {
  await adminUser.productFormPage.skuInput.fill(testProduct.sku);
  await adminUser.productFormPage.nameInput.fill(testProduct.name);
  await adminUser.productFormPage.categorySelect.selectOption(testProduct.category);
  await adminUser.productFormPage.supplierSelect.selectOption(testProduct.supplier);
  await adminUser.productFormPage.priceInput.fill(testProduct.price);
  await adminUser.productFormPage.stockInput.fill(testProduct.stock);
  await adminUser.productFormPage.draftStatusRadio.check();
  await adminUser.productFormPage.createButton.click();
});

Then('the admin user sees that the message "Created <SKU> <name>." appears', async ({ adminUser, testProduct }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Created <SKU> <name>." appears.').toContainText(`Created ${testProduct.sku} ${testProduct.name}.`);
});

Then("the admin user sees that the product's page shows price $19.99, stock 25, status Draft and supplier Granite Works", async ({ adminUser }) => {
  await expect(adminUser.productPage.priceValue, "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.").toHaveText('$19.99');
  await expect(adminUser.productPage.stockValue, "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.").toHaveText('25');
  await expect(adminUser.productPage.statusValue, "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.").toHaveText('Draft');
  await expect(adminUser.productPage.supplierValue, "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.").toHaveText('Granite Works');
});

Then("the admin user sees that the product's page says it was created by the signed-in admin", async ({ adminUser }) => {
  await expect(adminUser.productPage.createdValue, "The product's page says it was created by the signed-in admin.").toContainText(`by ${adminUser.account.name}`);
});

When('the admin user opens the Products page and searches for the SKU', async ({ adminUser, testProduct }) => {
  await adminUser.page.goto(adminUser.productsPage.path);
  await adminUser.productsPage.searchInput.fill(testProduct.sku);
});

Then('the admin user sees that exactly one product is listed: the new one', async ({ adminUser, testProduct }) => {
  await expect(adminUser.productsPage.productRows, 'Exactly one product is listed: the new one.').toHaveCount(1);
  await expect(adminUser.productsPage.productRow(testProduct.sku), 'Exactly one product is listed: the new one.').toBeVisible();
});

When('the admin user opens the New product form and selects Create product without entering anything', async ({ adminUser }) => {
  await adminUser.page.goto(adminUser.productFormPage.path);
  await adminUser.productFormPage.createButton.click();
});

Then('the admin user sees that SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.skuInput, 'SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."').toHaveAccessibleErrorMessage('Enter a SKU like ABC-1234: three capital letters, a dash and four digits.');
});

Then('the admin user sees that Name says "Enter a name."', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.nameInput, 'Name says "Enter a name."').toHaveAccessibleErrorMessage('Enter a name.');
});

Then('the admin user sees that Category says "Choose a category."', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.categorySelect, 'Category says "Choose a category."').toHaveAccessibleErrorMessage('Choose a category.');
});

Then('the admin user sees that Price \\(USD\\) says "Enter a price greater than 0 and no more than 100,000."', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.priceInput, 'Price (USD) says "Enter a price greater than 0 and no more than 100,000."').toHaveAccessibleErrorMessage('Enter a price greater than 0 and no more than 100,000.');
});

When('the admin user enters the duplicate SKU and the other test data, then selects Create product', async ({ adminUser }) => {
  await adminUser.productFormPage.skuInput.fill('ELE-1001');
  await adminUser.productFormPage.nameInput.fill('Test product with a duplicate SKU');
  await adminUser.productFormPage.categorySelect.selectOption('Home & Kitchen');
  await adminUser.productFormPage.priceInput.fill('10.00');
  await adminUser.productFormPage.stockInput.fill('0');
  await adminUser.productFormPage.createButton.click();
});

Then('the admin user sees that SKU says "Another product already uses SKU ELE-1001."', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.skuInput, 'SKU says "Another product already uses SKU ELE-1001."').toHaveAccessibleErrorMessage('Another product already uses SKU ELE-1001.');
});

Then('the admin user sees that the New product form is still open', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.newProductHeading, 'The New product form is still open.').toBeVisible();
});

When('the admin user enters the bad stock and selects Create product', async ({ adminUser }) => {
  await adminUser.productFormPage.stockInput.fill('-1');
  await adminUser.productFormPage.createButton.click();
});

Then('the admin user sees that Stock says "Enter a whole number, 0 or more."', async ({ adminUser }) => {
  await expect(adminUser.productFormPage.stockInput, 'Stock says "Enter a whole number, 0 or more."').toHaveAccessibleErrorMessage('Enter a whole number, 0 or more.');
});

When('the admin user creates a product with the test data', async ({ adminUser, testProduct }) => {
  await adminUser.page.goto(adminUser.productFormPage.path);
  await adminUser.productFormPage.skuInput.fill(testProduct.sku);
  await adminUser.productFormPage.nameInput.fill(testProduct.name);
  await adminUser.productFormPage.categorySelect.selectOption(testProduct.category);
  await adminUser.productFormPage.supplierSelect.selectOption(testProduct.supplier);
  await adminUser.productFormPage.priceInput.fill(testProduct.price);
  await adminUser.productFormPage.stockInput.fill(testProduct.stock);
  await adminUser.productFormPage.draftStatusRadio.check();
  await adminUser.productFormPage.createButton.click();
});

Then("the admin user sees that the product's page opens", async ({ adminUser, testProduct }) => {
  await expect(adminUser.productPage.heading, "The product's page opens.").toHaveText(testProduct.name);
});

When('the admin user selects Edit, enters the new price and stock, chooses the image, and selects Save changes', async ({ adminUser }) => {
  await adminUser.productPage.editLink.click();
  await adminUser.productFormPage.priceInput.fill('24.50');
  await adminUser.productFormPage.stockInput.fill('3');
  await adminUser.productFormPage.imageInput.setInputFiles(PRODUCT_IMAGE);
  await adminUser.productFormPage.saveButton.click();
});

Then('the admin user sees that the message "Saved changes to <SKU> <name>." appears', async ({ adminUser, testProduct }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Saved changes to <SKU> <name>." appears.').toContainText(`Saved changes to ${testProduct.sku} ${testProduct.name}.`);
});

Then("the admin user sees that the product's page shows price $24.50 and stock 3 with a Low stock badge", async ({ adminUser }) => {
  await expect(adminUser.productPage.priceValue, "The product's page shows price $24.50 and stock 3 with a Low stock badge.").toHaveText('$24.50');
  await expect(adminUser.productPage.stockValue, "The product's page shows price $24.50 and stock 3 with a Low stock badge.").toHaveText(/^3\s*Low stock$/);
});

Then("the admin user sees that the product's photo is shown", async ({ adminUser }) => {
  await expect(adminUser.productPage.photoImage, "The product's photo is shown.").toBeVisible();
});

When('the admin user opens the Activity log and chooses Product in Type', async ({ adminUser }) => {
  await adminUser.navbarPage.activityLogLink.click();
  await adminUser.activityLogPage.typeSelect.selectOption('Product');
});

Then('the admin user sees that an Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3"', async ({ adminUser, testProduct }) => {
  await expect(adminUser.activityLogPage.updatedEntryRows(`${testProduct.sku} ${testProduct.name}`), 'An Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3".').toContainText(['Price: 19.99 → 24.50; Stock: 25 → 3']);
});

When('the admin user selects Delete', async ({ adminUser }) => {
  await adminUser.productPage.deleteButton.click();
});

Then('the admin user sees that a Delete product dialog asks "Delete <SKU> <name>? This can\'t be undone."', async ({ adminUser, testProduct }) => {
  await expect(adminUser.deleteProductDialog.dialog, 'A Delete product dialog asks "Delete <SKU> <name>? This can\'t be undone."').toContainText(`Delete ${testProduct.sku} ${testProduct.name}? This can't be undone.`);
});

When('the admin user selects Cancel', async ({ adminUser }) => {
  await adminUser.deleteProductDialog.cancelButton.click();
});

Then("the admin user sees that the dialog closes, and the product's page is still shown", async ({ adminUser, testProduct }) => {
  await expect(adminUser.deleteProductDialog.dialog, "The dialog closes, and the product's page is still shown.").toBeHidden();
  await expect(adminUser.productPage.heading, "The dialog closes, and the product's page is still shown.").toHaveText(testProduct.name);
});

When('the admin user selects Delete, then selects Delete in the dialog', async ({ adminUser }) => {
  await adminUser.productPage.deleteButton.click();
  await adminUser.deleteProductDialog.confirmButton.click();
});

Then('the admin user sees that the message "Deleted <SKU> <name>." appears', async ({ adminUser, testProduct }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Deleted <SKU> <name>." appears.').toContainText(`Deleted ${testProduct.sku} ${testProduct.name}.`);
});

Then('the admin user sees that the Products page opens', async ({ adminUser }) => {
  await expect(adminUser.productsPage.heading, 'The Products page opens.').toBeVisible();
});

When('the admin user searches the Products page for the SKU', async ({ adminUser, testProduct }) => {
  await adminUser.productsPage.searchInput.fill(testProduct.sku);
});

Then('the admin user sees that the page says "No products match these filters."', async ({ adminUser }) => {
  await expect(adminUser.productsPage.summaryText, 'The page says "No products match these filters."').toHaveText('No products match these filters.');
});
