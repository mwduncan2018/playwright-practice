import { readFile } from 'node:fs/promises';

import { expect, plan, test } from '../fixtures';

test(
  'SC-003 Search and filter products',
  { tag: '@regression', annotation: plan('SC-003') },
  async ({ page, catalog }) => {
    const { products } = catalog;

    await test.step('1. Open the Products page and enter "lamp" in Search.', async () => {
      await products.goto();
      await products.search.fill('lamp');
      await expect(
        products.productNames,
        'Exactly two products are listed: LED Desk Lamp and LED Headlamp.',
      ).toHaveText(['LED Desk Lamp', 'LED Headlamp']);
      await expect(page, 'The address includes search=lamp.').toHaveURL(/search=lamp/);
    });

    await test.step('2. Select Clear filters.', async () => {
      await products.clearFilters.click();
      await expect(products.search, 'Search is empty again.').toHaveValue('');
    });

    await test.step('3. Choose Toys & Games in Category and Active in Status.', async () => {
      await products.category.selectOption('Toys & Games');
      await products.status.selectOption('Active');
      await expect(products.summary, 'The page says "Showing 1–9 of 9 products".').toHaveText(
        'Showing 1–9 of 9 products',
      );
    });

    await test.step('4. Check "Low stock only".', async () => {
      await products.lowStockOnly.check();
      await expect(
        products.productNames,
        'Exactly two products are listed: Remote Control Car and Stunt Kite.',
      ).toHaveText(['Remote Control Car', 'Stunt Kite']);
    });

    await test.step('5. Enter 30 in Min price.', async () => {
      await products.minPrice.fill('30');
      await expect(products.productNames, 'Only Remote Control Car is listed.').toHaveText(['Remote Control Car']);
    });
  },
);

test(
  'SC-004 Sort, page through and export products',
  { tag: '@regression', annotation: plan('SC-004') },
  async ({ catalog }) => {
    const { products } = catalog;

    await test.step('1. Open the Products page and choose Electronics in Category.', async () => {
      await products.goto();
      await products.category.selectOption('Electronics');
      await expect(products.summary, 'The page says "Showing 1–10 of 10 products".').toHaveText(
        'Showing 1–10 of 10 products',
      );
    });

    await test.step('2. Select the Price column heading twice.', async () => {
      await products.sortBy('Price');
      await expect(products.columnHeader('Price')).toHaveAttribute('aria-sort', 'ascending');
      await products.sortBy('Price');
      await expect(
        products.columnHeader('Price'),
        'The Price column is sorted from highest to lowest.',
      ).toHaveAttribute('aria-sort', 'descending');
      await expect(products.rows.first(), 'The first product is 27-inch Monitor at $279.00.').toContainText(
        /27-inch Monitor.*\$279\.00/,
      );
    });

    await test.step('3. Select the Price column heading again.', async () => {
      await products.sortBy('Price');
      await expect(products.rows.first(), 'The first product is USB-C Charging Cable at $12.99.').toContainText(
        /USB-C Charging Cable.*\$12\.99/,
      );
    });

    await test.step('4. Select Export CSV.', async () => {
      const download = await products.exportToCsv();
      // The server names the file with today's date in UTC.
      const today = new Date().toISOString().slice(0, 10);
      expect(download.suggestedFilename(), "A file named products-<today's date>.csv downloads.").toBe(
        `products-${today}.csv`,
      );
      const lines = (await readFile(await download.path(), 'utf8')).trim().split('\n');
      const contents = 'The file has a heading row and 10 product rows.';
      expect(lines[0], contents).toMatch(/^SKU,Name,Category/);
      expect(lines, contents).toHaveLength(11);
    });

    await test.step('5. Select Clear filters, choose 25 in Rows per page, then select the next-page arrow (›).', async () => {
      await products.clearFilters.click();
      await products.rowsPerPage.selectOption('25');
      await expect(products.summary).toHaveText(/^Showing 1–25 of /);
      await products.nextPage.click();
      await expect(products.summary, 'The page says "Showing 26–50 of" and the total.').toHaveText(
        /^Showing 26–50 of \d+ products$/,
      );
      await expect(products.currentPage(2), 'Page 2 is marked as the current page.').toBeVisible();
    });
  },
);
