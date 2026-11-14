import { expect, plan, test } from './fixtures';
import { newTestProduct, PRODUCT_IMAGE } from './test-data';

test.use({ signedInAs: 'admin' });

test('SC-005 Create a product', { tag: '@smoke', annotation: plan('SC-005') }, async ({ catalog, user }) => {
  const product = newTestProduct();

  await test.step('1. Open the Products page and select New product.', async () => {
    await catalog.products.goto();
    await catalog.products.newProduct.click();
    await expect(catalog.productForm.newProductHeading, 'The New product form opens.').toBeVisible();
  });

  await test.step('2. Fill in the form with the test data and select Create product.', async () => {
    await catalog.productForm.create(product);
    await expect(
      catalog.layout.message(`Created ${product.sku} ${product.name}.`),
      'The message "Created <SKU> <name>." appears.',
    ).toBeVisible();
    const shows = "The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.";
    await expect(catalog.product.detail('price'), shows).toHaveText('$19.99');
    await expect(catalog.product.detail('stock'), shows).toHaveText('25');
    await expect(catalog.product.detail('status'), shows).toHaveText('Draft');
    await expect(catalog.product.detail('supplier'), shows).toHaveText('Granite Works');
    await expect(
      catalog.product.detail('created'),
      "The product's page says it was created by the signed-in admin.",
    ).toContainText(`by ${user.name}`);
  });

  await test.step('3. Open the Products page and search for the SKU.', async () => {
    await catalog.products.goto();
    await catalog.products.search.fill(product.sku);
    const onlyTheNewOne = 'Exactly one product is listed: the new one.';
    await expect(catalog.products.rows, onlyTheNewOne).toHaveCount(1);
    await expect(catalog.products.row(product.sku), onlyTheNewOne).toBeVisible();
  });
});

test('SC-006 Product form validation', { tag: '@regression', annotation: plan('SC-006') }, async ({ catalog }) => {
  const form = catalog.productForm;

  await test.step('1. Open the New product form and select Create product without entering anything.', async () => {
    await form.goto();
    await form.createButton.click();
    await expect(
      form.sku,
      'SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."',
    ).toHaveAccessibleErrorMessage('Enter a SKU like ABC-1234: three capital letters, a dash and four digits.');
    await expect(form.name, 'Name says "Enter a name."').toHaveAccessibleErrorMessage('Enter a name.');
    await expect(form.category, 'Category says "Choose a category."').toHaveAccessibleErrorMessage(
      'Choose a category.',
    );
    await expect(
      form.price,
      'Price (USD) says "Enter a price greater than 0 and no more than 100,000."',
    ).toHaveAccessibleErrorMessage('Enter a price greater than 0 and no more than 100,000.');
  });

  await test.step('2. Enter the duplicate SKU and the other test data, then select Create product.', async () => {
    await form.create({
      sku: 'ELE-1001',
      name: 'Test product with a duplicate SKU',
      category: 'Home & Kitchen',
      price: '10.00',
      stock: '0',
    });
    await expect(form.sku, 'SKU says "Another product already uses SKU ELE-1001."').toHaveAccessibleErrorMessage(
      'Another product already uses SKU ELE-1001.',
    );
    await expect(form.newProductHeading, 'The New product form is still open.').toBeVisible();
  });

  await test.step('3. Enter the bad stock and select Create product.', async () => {
    await form.stock.fill('-1');
    await form.createButton.click();
    await expect(form.stock, 'Stock says "Enter a whole number, 0 or more."').toHaveAccessibleErrorMessage(
      'Enter a whole number, 0 or more.',
    );
  });
});

test(
  'SC-007 Edit a product and add an image',
  { tag: '@regression', annotation: plan('SC-007') },
  async ({ catalog }) => {
    const product = newTestProduct();

    await test.step('1. Create a product with the test data.', async () => {
      await catalog.productForm.goto();
      await catalog.productForm.create(product);
      await expect(catalog.product.heading(product.name), "The product's page opens.").toBeVisible();
    });

    await test.step('2. Select Edit, enter the new price and stock, choose the image, and select Save changes.', async () => {
      await catalog.product.editLink.click();
      await catalog.productForm.price.fill('24.50');
      await catalog.productForm.stock.fill('3');
      await catalog.productForm.image.setInputFiles(PRODUCT_IMAGE);
      await catalog.productForm.saveButton.click();
      await expect(
        catalog.layout.message(`Saved changes to ${product.sku} ${product.name}.`),
        'The message "Saved changes to <SKU> <name>." appears.',
      ).toBeVisible();
      const shows = "The product's page shows price $24.50 and stock 3 with a Low stock badge.";
      await expect(catalog.product.detail('price'), shows).toHaveText('$24.50');
      await expect(catalog.product.detail('stock'), shows).toHaveText(/^3\s*Low stock$/);
      await expect(catalog.product.photo(product.name), "The product's photo is shown.").toBeVisible();
    });

    await test.step('3. Open the Activity log and choose Product in Type.', async () => {
      await catalog.layout.menuLink('Activity log').click();
      await catalog.activityLog.type.selectOption('Product');
      await expect(
        catalog.activityLog
          .entries(`${product.sku} ${product.name}`)
          .filter({ hasText: 'Updated' })
          .filter({ hasText: 'Price: 19.99 → 24.50; Stock: 25 → 3' }),
        'An Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3".',
      ).toBeVisible();
    });
  },
);

test('SC-008 Delete a product', { tag: '@regression', annotation: plan('SC-008') }, async ({ catalog }) => {
  const product = newTestProduct();
  const dialog = catalog.product.deleteDialog;

  await test.step('1. Create a product with the test data.', async () => {
    await catalog.productForm.goto();
    await catalog.productForm.create(product);
    await expect(catalog.product.heading(product.name), "The product's page opens.").toBeVisible();
  });

  await test.step('2. Select Delete.', async () => {
    await catalog.product.deleteButton.click();
    await expect(
      dialog.dialog,
      'A Delete product dialog asks "Delete <SKU> <name>? This can\'t be undone."',
    ).toContainText(`Delete ${product.sku} ${product.name}? This can't be undone.`);
  });

  await test.step('3. Select Cancel.', async () => {
    await dialog.cancelButton.click();
    const stillShown = "The dialog closes, and the product's page is still shown.";
    await expect(dialog.dialog, stillShown).toBeHidden();
    await expect(catalog.product.heading(product.name), stillShown).toBeVisible();
  });

  await test.step('4. Select Delete, then select Delete in the dialog.', async () => {
    await catalog.product.deleteButton.click();
    await dialog.confirmButton.click();
    await expect(
      catalog.layout.message(`Deleted ${product.sku} ${product.name}.`),
      'The message "Deleted <SKU> <name>." appears.',
    ).toBeVisible();
    await expect(catalog.products.heading, 'The Products page opens.').toBeVisible();
  });

  await test.step('5. Search the Products page for the SKU.', async () => {
    await catalog.products.search.fill(product.sku);
    await expect(catalog.products.summary, 'The page says "No products match these filters."').toHaveText(
      'No products match these filters.',
    );
  });
});
