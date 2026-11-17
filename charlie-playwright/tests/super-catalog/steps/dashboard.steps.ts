import { expect, Then, When } from '../fixtures';

When('the standard user opens the Dashboard', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.dashboardPage.path);
});

Then('the standard user sees that the browser tab\'s title is "Dashboard · Super Catalog"', async ({ standardUser }) => {
  await expect(standardUser.page, 'The browser tab\'s title is "Dashboard · Super Catalog".').toHaveTitle('Dashboard · Super Catalog');
});

Then('the standard user sees that counts are shown for Products, Active products, Low stock, Categories and Suppliers', async ({ standardUser }) => {
  const dashboardCounts = [standardUser.dashboardPage.productsCardNumber, standardUser.dashboardPage.activeProductsCardNumber, standardUser.dashboardPage.lowStockCardNumber, standardUser.dashboardPage.categoriesCardNumber, standardUser.dashboardPage.suppliersCardNumber];
  for (const dashboardCount of dashboardCounts) {
    await expect(dashboardCount, 'Counts are shown for Products, Active products, Low stock, Categories and Suppliers.').toHaveText(/^\d+$/);
  }
});

Then('the standard user sees that the Suppliers count is 8', async ({ standardUser }) => {
  await expect(standardUser.dashboardPage.suppliersCardNumber, 'The Suppliers count is 8.').toHaveText('8');
});

When('the standard user selects "See all low-stock products"', async ({ standardUser }) => {
  await standardUser.dashboardPage.lowStockLink.click();
});

Then('the standard user sees that the Products page opens with "Low stock only" checked', async ({ standardUser }) => {
  await expect(standardUser.productsPage.lowStockOnlyCheckbox, 'The Products page opens with "Low stock only" checked.').toBeChecked();
});

Then('the standard user sees that every product listed has a Low badge', async ({ standardUser }) => {
  await expect(standardUser.productsPage.firstProductRow, 'Every product listed has a Low badge.').toBeVisible();
  await expect(standardUser.productsPage.productRowsWithoutLowBadge, 'Every product listed has a Low badge.').toHaveCount(0);
});
