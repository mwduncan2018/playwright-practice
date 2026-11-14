import { expect, plan, test } from './fixtures';

test(
  'SC-002 Dashboard counts and low-stock products',
  { tag: '@smoke', annotation: plan('SC-002') },
  async ({ standard }) => {
    await test.step('1. Open the Dashboard.', async () => {
      await standard.page.goto(standard.dashboard.path);
      await expect(standard.page, 'The browser tab\'s title is "Dashboard · Super Catalog".').toHaveTitle(
        'Dashboard · Super Catalog',
      );
      const counts = [
        standard.dashboard.productsCount,
        standard.dashboard.activeCount,
        standard.dashboard.lowStockCount,
        standard.dashboard.categoriesCount,
        standard.dashboard.suppliersCount,
      ];
      for (const count of counts) {
        await expect(
          count,
          'Counts are shown for Products, Active products, Low stock, Categories and Suppliers.',
        ).toHaveText(/^\d+$/);
      }
      await expect(standard.dashboard.suppliersCount, 'The Suppliers count is 8.').toHaveText('8');
    });

    await test.step('2. Select "See all low-stock products".', async () => {
      await standard.dashboard.lowStockLink.click();
      await expect(
        standard.products.lowStockOnly,
        'The Products page opens with "Low stock only" checked.',
      ).toBeChecked();
      const everyRowLow = 'Every product listed has a Low badge.';
      await expect(standard.products.rows.first(), everyRowLow).toBeVisible();
      await expect(standard.products.rowsWithoutLowBadge, everyRowLow).toHaveCount(0);
    });
  },
);
