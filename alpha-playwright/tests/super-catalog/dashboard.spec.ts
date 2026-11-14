import { expect, plan, test } from './fixtures';

test(
  'SC-002 Dashboard counts and low-stock products',
  { tag: '@smoke', annotation: plan('SC-002') },
  async ({ page, catalog }) => {
    const { dashboard } = catalog;

    await test.step('1. Open the Dashboard.', async () => {
      await page.goto(dashboard.path);
      await expect(page, 'The browser tab\'s title is "Dashboard · Super Catalog".').toHaveTitle(
        'Dashboard · Super Catalog',
      );
      const counts = [
        dashboard.productsCount,
        dashboard.activeCount,
        dashboard.lowStockCount,
        dashboard.categoriesCount,
        dashboard.suppliersCount,
      ];
      for (const count of counts) {
        await expect(
          count,
          'Counts are shown for Products, Active products, Low stock, Categories and Suppliers.',
        ).toHaveText(/^\d+$/);
      }
      await expect(dashboard.suppliersCount, 'The Suppliers count is 8.').toHaveText('8');
    });

    await test.step('2. Select "See all low-stock products".', async () => {
      await dashboard.lowStockLink.click();
      await expect(
        catalog.products.lowStockOnly,
        'The Products page opens with "Low stock only" checked.',
      ).toBeChecked();
      const everyRowLow = 'Every product listed has a Low badge.';
      await expect(catalog.products.rows.first(), everyRowLow).toBeVisible();
      await expect(catalog.products.rowsWithoutLowBadge, everyRowLow).toHaveCount(0);
    });
  },
);
