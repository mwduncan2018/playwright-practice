import { expect, plan, test } from './fixtures';
import { newTestProduct, PRODUCT_IMAGE } from './test-data';

test('SC-005 Create a product', { tag: '@smoke', annotation: plan('SC-005') }, async ({ adminUser }) => {
  const testProduct = newTestProduct();

  await test.step('1. Open the Products page and select New product.', async () => {
    await adminUser.page.goto(adminUser.productsPage.path);
    await adminUser.productsPage.newProduct.click();
    await expect(adminUser.productFormPage.newProductHeading, 'The New product form opens.').toBeVisible();
  });

  await test.step('2. Fill in the form with the test data and select Create product.', async () => {
    await adminUser.productFormPage.sku.fill(testProduct.sku);
    await adminUser.productFormPage.name.fill(testProduct.name);
    await adminUser.productFormPage.category.selectOption(testProduct.category);
    await adminUser.productFormPage.supplier.selectOption(testProduct.supplier);
    await adminUser.productFormPage.price.fill(testProduct.price);
    await adminUser.productFormPage.stock.fill(testProduct.stock);
    await adminUser.page.getByRole('radio', { name: testProduct.status, exact: true }).check();
    await adminUser.productFormPage.createButton.click();
    await expect(
      adminUser.alertsPage.messages.filter({ hasText: `Created ${testProduct.sku} ${testProduct.name}.` }),
      'The message "Created <SKU> <name>." appears.',
    ).toBeVisible();
    const expectedResult = "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.";
    await expect(adminUser.productPage.price, expectedResult).toHaveText('$19.99');
    await expect(adminUser.productPage.stock, expectedResult).toHaveText('25');
    await expect(adminUser.productPage.status, expectedResult).toHaveText('Draft');
    await expect(adminUser.productPage.supplier, expectedResult).toHaveText('Granite Works');
    await expect(adminUser.productPage.created, "The product's page says it was created by the signed-in admin.").toContainText(
      `by ${adminUser.account.name}`,
    );
  });

  await test.step('3. Open the Products page and search for the SKU.', async () => {
    await adminUser.page.goto(adminUser.productsPage.path);
    await adminUser.productsPage.search.fill(testProduct.sku);
    const expectedResult = 'Exactly one product is listed: the new one.';
    await expect(adminUser.productsPage.rows, expectedResult).toHaveCount(1);
    await expect(adminUser.productsPage.row(testProduct.sku), expectedResult).toBeVisible();
  });
});

test('SC-006 Product form validation', { tag: '@regression', annotation: plan('SC-006') }, async ({ adminUser }) => {
  await test.step('1. Open the New product form and select Create product without entering anything.', async () => {
    await adminUser.page.goto(adminUser.productFormPage.path);
    await adminUser.productFormPage.createButton.click();
    await expect(
      adminUser.productFormPage.sku,
      'SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."',
    ).toHaveAccessibleErrorMessage('Enter a SKU like ABC-1234: three capital letters, a dash and four digits.');
    await expect(adminUser.productFormPage.name, 'Name says "Enter a name."').toHaveAccessibleErrorMessage('Enter a name.');
    await expect(adminUser.productFormPage.category, 'Category says "Choose a category."').toHaveAccessibleErrorMessage(
      'Choose a category.',
    );
    await expect(
      adminUser.productFormPage.price,
      'Price (USD) says "Enter a price greater than 0 and no more than 100,000."',
    ).toHaveAccessibleErrorMessage('Enter a price greater than 0 and no more than 100,000.');
  });

  await test.step('2. Enter the duplicate SKU and the other test data, then select Create product.', async () => {
    await adminUser.productFormPage.sku.fill('ELE-1001');
    await adminUser.productFormPage.name.fill('Test product with a duplicate SKU');
    await adminUser.productFormPage.category.selectOption('Home & Kitchen');
    await adminUser.productFormPage.price.fill('10.00');
    await adminUser.productFormPage.stock.fill('0');
    await adminUser.productFormPage.createButton.click();
    await expect(
      adminUser.productFormPage.sku,
      'SKU says "Another product already uses SKU ELE-1001."',
    ).toHaveAccessibleErrorMessage('Another product already uses SKU ELE-1001.');
    await expect(adminUser.productFormPage.newProductHeading, 'The New product form is still open.').toBeVisible();
  });

  await test.step('3. Enter the bad stock and select Create product.', async () => {
    await adminUser.productFormPage.stock.fill('-1');
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productFormPage.stock, 'Stock says "Enter a whole number, 0 or more."').toHaveAccessibleErrorMessage(
      'Enter a whole number, 0 or more.',
    );
  });
});

test('SC-007 Edit a product and add an image', { tag: '@regression', annotation: plan('SC-007') }, async ({ adminUser }) => {
  const testProduct = newTestProduct();

  await test.step('1. Create a product with the test data.', async () => {
    await adminUser.page.goto(adminUser.productFormPage.path);
    await adminUser.productFormPage.sku.fill(testProduct.sku);
    await adminUser.productFormPage.name.fill(testProduct.name);
    await adminUser.productFormPage.category.selectOption(testProduct.category);
    await adminUser.productFormPage.supplier.selectOption(testProduct.supplier);
    await adminUser.productFormPage.price.fill(testProduct.price);
    await adminUser.productFormPage.stock.fill(testProduct.stock);
    await adminUser.page.getByRole('radio', { name: testProduct.status, exact: true }).check();
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productPage.heading, "The product's page opens.").toHaveText(testProduct.name);
  });

  await test.step('2. Select Edit, enter the new price and stock, choose the image, and select Save changes.', async () => {
    await adminUser.productPage.editLink.click();
    await adminUser.productFormPage.price.fill('24.50');
    await adminUser.productFormPage.stock.fill('3');
    await adminUser.productFormPage.image.setInputFiles(PRODUCT_IMAGE);
    await adminUser.productFormPage.saveButton.click();
    await expect(
      adminUser.alertsPage.messages.filter({ hasText: `Saved changes to ${testProduct.sku} ${testProduct.name}.` }),
      'The message "Saved changes to <SKU> <name>." appears.',
    ).toBeVisible();
    const expectedResult = "The product's page shows price $24.50 and stock 3 with a Low stock badge.";
    await expect(adminUser.productPage.price, expectedResult).toHaveText('$24.50');
    await expect(adminUser.productPage.stock, expectedResult).toHaveText(/^3\s*Low stock$/);
    await expect(adminUser.productPage.photo, "The product's photo is shown.").toBeVisible();
  });

  await test.step('3. Open the Activity log and choose Product in Type.', async () => {
    await adminUser.navbarPage.activityLogLink.click();
    await adminUser.activityLogPage.type.selectOption('Product');
    await expect(
      adminUser.activityLogPage
        .entries(`${testProduct.sku} ${testProduct.name}`)
        .filter({ hasText: 'Updated' })
        .filter({ hasText: 'Price: 19.99 → 24.50; Stock: 25 → 3' }),
      'An Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3".',
    ).toBeVisible();
  });
});

test('SC-008 Delete a product', { tag: '@regression', annotation: plan('SC-008') }, async ({ adminUser }) => {
  const testProduct = newTestProduct();

  await test.step('1. Create a product with the test data.', async () => {
    await adminUser.page.goto(adminUser.productFormPage.path);
    await adminUser.productFormPage.sku.fill(testProduct.sku);
    await adminUser.productFormPage.name.fill(testProduct.name);
    await adminUser.productFormPage.category.selectOption(testProduct.category);
    await adminUser.productFormPage.supplier.selectOption(testProduct.supplier);
    await adminUser.productFormPage.price.fill(testProduct.price);
    await adminUser.productFormPage.stock.fill(testProduct.stock);
    await adminUser.page.getByRole('radio', { name: testProduct.status, exact: true }).check();
    await adminUser.productFormPage.createButton.click();
    await expect(adminUser.productPage.heading, "The product's page opens.").toHaveText(testProduct.name);
  });

  await test.step('2. Select Delete.', async () => {
    await adminUser.productPage.deleteButton.click();
    await expect(
      adminUser.deleteProductDialog.dialog,
      'A Delete product dialog asks "Delete <SKU> <name>? This can\'t be undone."',
    ).toContainText(`Delete ${testProduct.sku} ${testProduct.name}? This can't be undone.`);
  });

  await test.step('3. Select Cancel.', async () => {
    await adminUser.deleteProductDialog.cancelButton.click();
    const expectedResult = "The dialog closes, and the product's page is still shown.";
    await expect(adminUser.deleteProductDialog.dialog, expectedResult).toBeHidden();
    await expect(adminUser.productPage.heading, expectedResult).toHaveText(testProduct.name);
  });

  await test.step('4. Select Delete, then select Delete in the dialog.', async () => {
    await adminUser.productPage.deleteButton.click();
    await adminUser.deleteProductDialog.confirmButton.click();
    await expect(
      adminUser.alertsPage.messages.filter({ hasText: `Deleted ${testProduct.sku} ${testProduct.name}.` }),
      'The message "Deleted <SKU> <name>." appears.',
    ).toBeVisible();
    await expect(adminUser.productsPage.heading, 'The Products page opens.').toBeVisible();
  });

  await test.step('5. Search the Products page for the SKU.', async () => {
    await adminUser.productsPage.search.fill(testProduct.sku);
    await expect(adminUser.productsPage.summary, 'The page says "No products match these filters."').toHaveText(
      'No products match these filters.',
    );
  });
});
