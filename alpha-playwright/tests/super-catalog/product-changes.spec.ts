import { expect, plan, test } from './fixtures';
import { newTestProduct, PRODUCT_IMAGE } from './test-data';

test('SC-005 Create a product', { tag: '@smoke', annotation: plan('SC-005') }, async ({ admin }) => {
  const product = newTestProduct();

  await test.step('1. Open the Products page and select New product.', async () => {
    await admin.page.goto(admin.products.path);
    await admin.products.newProduct.click();
    await expect(admin.productForm.newProductHeading, 'The New product form opens.').toBeVisible();
  });

  await test.step('2. Fill in the form with the test data and select Create product.', async () => {
    await admin.productForm.sku.fill(product.sku);
    await admin.productForm.name.fill(product.name);
    await admin.productForm.category.selectOption(product.category);
    await admin.productForm.supplier.selectOption(product.supplier);
    await admin.productForm.price.fill(product.price);
    await admin.productForm.stock.fill(product.stock);
    await admin.page.getByRole('radio', { name: product.status, exact: true }).check();
    await admin.productForm.createButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Created ${product.sku} ${product.name}.` }),
      'The message "Created <SKU> <name>." appears.',
    ).toBeVisible();
    const shows = "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.";
    await expect(admin.product.price, shows).toHaveText('$19.99');
    await expect(admin.product.stock, shows).toHaveText('25');
    await expect(admin.product.status, shows).toHaveText('Draft');
    await expect(admin.product.supplier, shows).toHaveText('Granite Works');
    await expect(admin.product.created, "The product's page says it was created by the signed-in admin.").toContainText(
      `by ${admin.account.name}`,
    );
  });

  await test.step('3. Open the Products page and search for the SKU.', async () => {
    await admin.page.goto(admin.products.path);
    await admin.products.search.fill(product.sku);
    const onlyTheNewOne = 'Exactly one product is listed: the new one.';
    await expect(admin.products.rows, onlyTheNewOne).toHaveCount(1);
    await expect(admin.products.row(product.sku), onlyTheNewOne).toBeVisible();
  });
});

test('SC-006 Product form validation', { tag: '@regression', annotation: plan('SC-006') }, async ({ admin }) => {
  await test.step('1. Open the New product form and select Create product without entering anything.', async () => {
    await admin.page.goto(admin.productForm.path);
    await admin.productForm.createButton.click();
    await expect(
      admin.productForm.sku,
      'SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."',
    ).toHaveAccessibleErrorMessage('Enter a SKU like ABC-1234: three capital letters, a dash and four digits.');
    await expect(admin.productForm.name, 'Name says "Enter a name."').toHaveAccessibleErrorMessage('Enter a name.');
    await expect(admin.productForm.category, 'Category says "Choose a category."').toHaveAccessibleErrorMessage(
      'Choose a category.',
    );
    await expect(
      admin.productForm.price,
      'Price (USD) says "Enter a price greater than 0 and no more than 100,000."',
    ).toHaveAccessibleErrorMessage('Enter a price greater than 0 and no more than 100,000.');
  });

  await test.step('2. Enter the duplicate SKU and the other test data, then select Create product.', async () => {
    await admin.productForm.sku.fill('ELE-1001');
    await admin.productForm.name.fill('Test product with a duplicate SKU');
    await admin.productForm.category.selectOption('Home & Kitchen');
    await admin.productForm.price.fill('10.00');
    await admin.productForm.stock.fill('0');
    await admin.productForm.createButton.click();
    await expect(
      admin.productForm.sku,
      'SKU says "Another product already uses SKU ELE-1001."',
    ).toHaveAccessibleErrorMessage('Another product already uses SKU ELE-1001.');
    await expect(admin.productForm.newProductHeading, 'The New product form is still open.').toBeVisible();
  });

  await test.step('3. Enter the bad stock and select Create product.', async () => {
    await admin.productForm.stock.fill('-1');
    await admin.productForm.createButton.click();
    await expect(admin.productForm.stock, 'Stock says "Enter a whole number, 0 or more."').toHaveAccessibleErrorMessage(
      'Enter a whole number, 0 or more.',
    );
  });
});

test('SC-007 Edit a product and add an image', { tag: '@regression', annotation: plan('SC-007') }, async ({ admin }) => {
  const product = newTestProduct();

  await test.step('1. Create a product with the test data.', async () => {
    await admin.page.goto(admin.productForm.path);
    await admin.productForm.sku.fill(product.sku);
    await admin.productForm.name.fill(product.name);
    await admin.productForm.category.selectOption(product.category);
    await admin.productForm.supplier.selectOption(product.supplier);
    await admin.productForm.price.fill(product.price);
    await admin.productForm.stock.fill(product.stock);
    await admin.page.getByRole('radio', { name: product.status, exact: true }).check();
    await admin.productForm.createButton.click();
    await expect(admin.product.heading, "The product's page opens.").toHaveText(product.name);
  });

  await test.step('2. Select Edit, enter the new price and stock, choose the image, and select Save changes.', async () => {
    await admin.product.editLink.click();
    await admin.productForm.price.fill('24.50');
    await admin.productForm.stock.fill('3');
    await admin.productForm.image.setInputFiles(PRODUCT_IMAGE);
    await admin.productForm.saveButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Saved changes to ${product.sku} ${product.name}.` }),
      'The message "Saved changes to <SKU> <name>." appears.',
    ).toBeVisible();
    const shows = "The product's page shows price $24.50 and stock 3 with a Low stock badge.";
    await expect(admin.product.price, shows).toHaveText('$24.50');
    await expect(admin.product.stock, shows).toHaveText(/^3\s*Low stock$/);
    await expect(admin.product.photo, "The product's photo is shown.").toBeVisible();
  });

  await test.step('3. Open the Activity log and choose Product in Type.', async () => {
    await admin.navbar.activityLogLink.click();
    await admin.activityLog.type.selectOption('Product');
    await expect(
      admin.activityLog
        .entries(`${product.sku} ${product.name}`)
        .filter({ hasText: 'Updated' })
        .filter({ hasText: 'Price: 19.99 → 24.50; Stock: 25 → 3' }),
      'An Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3".',
    ).toBeVisible();
  });
});

test('SC-008 Delete a product', { tag: '@regression', annotation: plan('SC-008') }, async ({ admin }) => {
  const product = newTestProduct();

  await test.step('1. Create a product with the test data.', async () => {
    await admin.page.goto(admin.productForm.path);
    await admin.productForm.sku.fill(product.sku);
    await admin.productForm.name.fill(product.name);
    await admin.productForm.category.selectOption(product.category);
    await admin.productForm.supplier.selectOption(product.supplier);
    await admin.productForm.price.fill(product.price);
    await admin.productForm.stock.fill(product.stock);
    await admin.page.getByRole('radio', { name: product.status, exact: true }).check();
    await admin.productForm.createButton.click();
    await expect(admin.product.heading, "The product's page opens.").toHaveText(product.name);
  });

  await test.step('2. Select Delete.', async () => {
    await admin.product.deleteButton.click();
    await expect(
      admin.deleteProductDialog.dialog,
      'A Delete product dialog asks "Delete <SKU> <name>? This can\'t be undone."',
    ).toContainText(`Delete ${product.sku} ${product.name}? This can't be undone.`);
  });

  await test.step('3. Select Cancel.', async () => {
    await admin.deleteProductDialog.cancelButton.click();
    const stillShown = "The dialog closes, and the product's page is still shown.";
    await expect(admin.deleteProductDialog.dialog, stillShown).toBeHidden();
    await expect(admin.product.heading, stillShown).toHaveText(product.name);
  });

  await test.step('4. Select Delete, then select Delete in the dialog.', async () => {
    await admin.product.deleteButton.click();
    await admin.deleteProductDialog.confirmButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Deleted ${product.sku} ${product.name}.` }),
      'The message "Deleted <SKU> <name>." appears.',
    ).toBeVisible();
    await expect(admin.products.heading, 'The Products page opens.').toBeVisible();
  });

  await test.step('5. Search the Products page for the SKU.', async () => {
    await admin.products.search.fill(product.sku);
    await expect(admin.products.summary, 'The page says "No products match these filters."').toHaveText(
      'No products match these filters.',
    );
  });
});
