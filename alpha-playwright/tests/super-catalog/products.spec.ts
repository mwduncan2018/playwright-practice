import { readFile } from 'node:fs/promises';

import { expect, plan, test } from './fixtures';

test('SC-003 Search and filter products', { tag: '@regression', annotation: plan('SC-003') }, async ({ standardUser }) => {
  await test.step('1. Open the Products page and enter "lamp" in Search.', async () => {
    await standardUser.page.goto(standardUser.productsPage.path);
    await standardUser.productsPage.search.fill('lamp');
    await expect(
      standardUser.productsPage.productNames,
      'Exactly two products are listed: LED Desk Lamp and LED Headlamp.',
    ).toHaveText(['LED Desk Lamp', 'LED Headlamp']);
    await expect(standardUser.page, 'The address includes search=lamp.').toHaveURL(/search=lamp/);
  });

  await test.step('2. Select Clear filters.', async () => {
    await standardUser.productsPage.clearFilters.click();
    await expect(standardUser.productsPage.search, 'Search is empty again.').toHaveValue('');
  });

  await test.step('3. Choose Toys & Games in Category and Active in Status.', async () => {
    await standardUser.productsPage.category.selectOption('Toys & Games');
    await standardUser.productsPage.status.selectOption('Active');
    await expect(standardUser.productsPage.summary, 'The page says "Showing 1–9 of 9 products".').toHaveText(
      'Showing 1–9 of 9 products',
    );
  });

  await test.step('4. Check "Low stock only".', async () => {
    await standardUser.productsPage.lowStockOnly.check();
    await expect(
      standardUser.productsPage.productNames,
      'Exactly two products are listed: Remote Control Car and Stunt Kite.',
    ).toHaveText(['Remote Control Car', 'Stunt Kite']);
  });

  await test.step('5. Enter 30 in Min price.', async () => {
    await standardUser.productsPage.minPrice.fill('30');
    await expect(standardUser.productsPage.productNames, 'Only Remote Control Car is listed.').toHaveText([
      'Remote Control Car',
    ]);
  });
});

test('SC-004 Sort, page through and export products', { tag: '@regression', annotation: plan('SC-004') }, async ({ standardUser }) => {
  await test.step('1. Open the Products page and choose Electronics in Category.', async () => {
    await standardUser.page.goto(standardUser.productsPage.path);
    await standardUser.productsPage.category.selectOption('Electronics');
    await expect(standardUser.productsPage.summary, 'The page says "Showing 1–10 of 10 products".').toHaveText(
      'Showing 1–10 of 10 products',
    );
  });

  await test.step('2. Select the Price column heading twice.', async () => {
    await standardUser.productsPage.sortBy('Price');
    await expect(standardUser.productsPage.columnHeader('Price')).toHaveAttribute('aria-sort', 'ascending');
    await standardUser.productsPage.sortBy('Price');
    await expect(
      standardUser.productsPage.columnHeader('Price'),
      'The Price column is sorted from highest to lowest.',
    ).toHaveAttribute('aria-sort', 'descending');
    await expect(standardUser.productsPage.rows.first(), 'The first product is 27-inch Monitor at $279.00.').toContainText(
      /27-inch Monitor.*\$279\.00/,
    );
  });

  await test.step('3. Select the Price column heading again.', async () => {
    await standardUser.productsPage.sortBy('Price');
    await expect(
      standardUser.productsPage.rows.first(),
      'The first product is USB-C Charging Cable at $12.99.',
    ).toContainText(/USB-C Charging Cable.*\$12\.99/);
  });

  await test.step('4. Select Export CSV.', async () => {
    // Start waiting for the download before clicking, so it can't finish before the wait begins.
    const downloadPromise = standardUser.page.waitForEvent('download');
    await standardUser.productsPage.exportCsv.click();
    const csvDownload = await downloadPromise;
    // The server names the file with today's date in UTC.
    const todaysDate = new Date().toISOString().slice(0, 10);
    expect(csvDownload.suggestedFilename(), "A file named products-<today's date>.csv downloads.").toBe(
      `products-${todaysDate}.csv`,
    );
    const csvLines = (await readFile(await csvDownload.path(), 'utf8')).trim().split('\n');
    const expectedResult = 'The file has a heading row and 10 product rows.';
    expect(csvLines[0], expectedResult).toMatch(/^SKU,Name,Category/);
    expect(csvLines, expectedResult).toHaveLength(11);
  });

  await test.step('5. Select Clear filters, choose 25 in Rows per page, then select the next-page arrow (›).', async () => {
    await standardUser.productsPage.clearFilters.click();
    await standardUser.productsPage.rowsPerPage.selectOption('25');
    await expect(standardUser.productsPage.summary).toHaveText(/^Showing 1–25 of /);
    await standardUser.productsPage.nextPage.click();
    await expect(standardUser.productsPage.summary, 'The page says "Showing 26–50 of" and the total.').toHaveText(
      /^Showing 26–50 of \d+ products$/,
    );
    await expect(standardUser.productsPage.currentPage(2), 'Page 2 is marked as the current page.').toBeVisible();
  });
});
