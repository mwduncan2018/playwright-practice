import { expect, plan, test } from './fixtures';

test('SC-010 Standard users can view but not change', { tag: '@smoke', annotation: plan('SC-010') }, async ({ standardUser }) => {
  await test.step('1. Open the Products page.', async () => {
    await standardUser.page.goto(standardUser.productsPage.path);
    // Wait for the list, so the check below isn't made before the page has drawn.
    await expect(standardUser.productsPage.productRows.first()).toBeVisible();
    await expect(standardUser.productsPage.newProductLink, "There's no New product button.").toHaveCount(0);
  });

  await test.step('2. Open Adjustable Dumbbells.', async () => {
    await standardUser.productsPage.productsTable.getByRole('link', { name: 'Adjustable Dumbbells', exact: true }).click();
    await expect(standardUser.productPage.skuValue, "The product's page shows SKU SPO-1002.").toHaveText('SPO-1002');
    const expectedResult = 'There are no Edit or Delete buttons.';
    await expect(standardUser.productPage.editLink, expectedResult).toHaveCount(0);
    await expect(standardUser.productPage.deleteButton, expectedResult).toHaveCount(0);
  });

  await test.step('3. Go to the address /products/new.', async () => {
    await standardUser.page.goto('/products/new');
    await expect(standardUser.accessDeniedPage.heading, 'The page says "You don\'t have access to this page".').toBeVisible();
  });

  await test.step('4. Look at the menu at the top of the page.', async () => {
    await expect(standardUser.navbarPage.activityLogLink, "There's no Activity log link.").toHaveCount(0);
  });
});
