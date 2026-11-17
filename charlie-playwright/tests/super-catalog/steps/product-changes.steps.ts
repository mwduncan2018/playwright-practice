import { expect, Then, When } from '../fixtures';

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
