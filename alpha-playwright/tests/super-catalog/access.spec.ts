import { expect, plan, test } from './fixtures';

test(
  'SC-010 Standard users can view but not change',
  { tag: '@smoke', annotation: plan('SC-010') },
  async ({ page, catalog }) => {
    await test.step('1. Open the Products page.', async () => {
      await page.goto(catalog.products.path);
      // Wait for the list, so the check below isn't made before the page has drawn.
      await expect(catalog.products.rows.first()).toBeVisible();
      await expect(catalog.products.newProduct, "There's no New product button.").toHaveCount(0);
    });

    await test.step('2. Open Adjustable Dumbbells.', async () => {
      await catalog.products.table.getByRole('link', { name: 'Adjustable Dumbbells', exact: true }).click();
      await expect(catalog.product.sku, "The product's page shows SKU SPO-1002.").toHaveText('SPO-1002');
      const noButtons = 'There are no Edit or Delete buttons.';
      await expect(catalog.product.editLink, noButtons).toHaveCount(0);
      await expect(catalog.product.deleteButton, noButtons).toHaveCount(0);
    });

    await test.step('3. Go to the address /products/new.', async () => {
      await page.goto('/products/new');
      await expect(catalog.accessDenied.heading, 'The page says "You don\'t have access to this page".').toBeVisible();
    });

    await test.step('4. Look at the menu at the top of the page.', async () => {
      await expect(catalog.layout.activityLogLink, "There's no Activity log link.").toHaveCount(0);
    });
  },
);
