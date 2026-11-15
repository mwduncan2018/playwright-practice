import { expect, plan, test } from './fixtures';

test('SC-002 Dashboard counts and low-stock products', { tag: '@smoke', annotation: plan('SC-002') }, async ({ standardUser }) => {
  await test.step('1. Open the Dashboard.', async () => {
    await standardUser.page.goto(standardUser.dashboardPage.path);
    await expect(standardUser.page, 'The browser tab\'s title is "Dashboard · Super Catalog".').toHaveTitle('Dashboard · Super Catalog');
    const dashboardCounts = [standardUser.dashboardPage.productsCardNumber, standardUser.dashboardPage.activeProductsCardNumber, standardUser.dashboardPage.lowStockCardNumber, standardUser.dashboardPage.categoriesCardNumber, standardUser.dashboardPage.suppliersCardNumber];
    for (const dashboardCount of dashboardCounts) {
      await expect(dashboardCount, 'Counts are shown for Products, Active products, Low stock, Categories and Suppliers.').toHaveText(/^\d+$/);
    }
    await expect(standardUser.dashboardPage.suppliersCardNumber, 'The Suppliers count is 8.').toHaveText('8');
  });

  await test.step('2. Select "See all low-stock products".', async () => {
    await standardUser.dashboardPage.lowStockLink.click();
    await expect(standardUser.productsPage.lowStockOnlyCheckbox, 'The Products page opens with "Low stock only" checked.').toBeChecked();
    const expectedResult = 'Every product listed has a Low badge.';
    await expect(standardUser.productsPage.firstProductRow, expectedResult).toBeVisible();
    await expect(standardUser.productsPage.productRowsWithoutLowBadge, expectedResult).toHaveCount(0);
  });
});
