import { readFile } from 'node:fs/promises';

import { expect, Then, When } from '../fixtures';

When('the standard user opens the Products page and enters "lamp" in Search', async ({ standardUser }) => {
  await standardUser.navbarPage.productsLink.click();
  await standardUser.productsPage.searchInput.fill('lamp');
});

Then('the standard user sees that exactly two products are listed: LED Desk Lamp and LED Headlamp', async ({ standardUser }) => {
  await expect(standardUser.productsPage.productNameLinks, 'Exactly two products are listed: LED Desk Lamp and LED Headlamp.').toHaveText(['LED Desk Lamp', 'LED Headlamp']);
});

Then('the standard user sees that the address includes search=lamp', async ({ standardUser }) => {
  await expect(standardUser.page, 'The address includes search=lamp.').toHaveURL(/search=lamp/);
});

When('the standard user selects Clear filters', async ({ standardUser }) => {
  await standardUser.productsPage.clearFiltersButton.click();
});

Then('the standard user sees that Search is empty again', async ({ standardUser }) => {
  await expect(standardUser.productsPage.searchInput, 'Search is empty again.').toHaveValue('');
});

When('the standard user chooses Toys & Games in Category and Active in Status', async ({ standardUser }) => {
  await standardUser.productsPage.categorySelect.selectOption('Toys & Games');
  await standardUser.productsPage.statusSelect.selectOption('Active');
});

Then('the standard user sees that the page says "Showing 1–9 of 9 products"', async ({ standardUser }) => {
  await expect(standardUser.productsPage.summaryText, 'The page says "Showing 1–9 of 9 products".').toHaveText('Showing 1–9 of 9 products');
});

When('the standard user checks "Low stock only"', async ({ standardUser }) => {
  await standardUser.productsPage.lowStockOnlyCheckbox.check();
});

Then('the standard user sees that exactly two products are listed: Remote Control Car and Stunt Kite', async ({ standardUser }) => {
  await expect(standardUser.productsPage.productNameLinks, 'Exactly two products are listed: Remote Control Car and Stunt Kite.').toHaveText(['Remote Control Car', 'Stunt Kite']);
});

When('the standard user enters 30 in Min price', async ({ standardUser }) => {
  await standardUser.productsPage.minPriceInput.fill('30');
});

Then('the standard user sees that only Remote Control Car is listed', async ({ standardUser }) => {
  await expect(standardUser.productsPage.productNameLinks, 'Only Remote Control Car is listed.').toHaveText(['Remote Control Car']);
});

When('the standard user opens the Products page and chooses Electronics in Category', async ({ standardUser }) => {
  await standardUser.navbarPage.productsLink.click();
  await standardUser.productsPage.categorySelect.selectOption('Electronics');
});

Then('the standard user sees that the page says "Showing 1–10 of 10 products"', async ({ standardUser }) => {
  await expect(standardUser.productsPage.summaryText, 'The page says "Showing 1–10 of 10 products".').toHaveText('Showing 1–10 of 10 products');
});

When('the standard user selects the Price column heading twice', async ({ standardUser }) => {
  await standardUser.productsPage.sortBy('Price');
  await expect(standardUser.productsPage.columnHeader('Price')).toHaveAttribute('aria-sort', 'ascending');
  await standardUser.productsPage.sortBy('Price');
});

Then('the standard user sees that the Price column is sorted from highest to lowest', async ({ standardUser }) => {
  await expect(standardUser.productsPage.columnHeader('Price'), 'The Price column is sorted from highest to lowest.').toHaveAttribute('aria-sort', 'descending');
});

Then('the standard user sees that the first product is 27-inch Monitor at $279.00', async ({ standardUser }) => {
  await expect(standardUser.productsPage.firstProductRow, 'The first product is 27-inch Monitor at $279.00.').toContainText(/27-inch Monitor.*\$279\.00/);
});

When('the standard user selects the Price column heading again', async ({ standardUser }) => {
  await standardUser.productsPage.sortBy('Price');
});

Then('the standard user sees that the first product is USB-C Charging Cable at $12.99', async ({ standardUser }) => {
  await expect(standardUser.productsPage.firstProductRow, 'The first product is USB-C Charging Cable at $12.99.').toContainText(/USB-C Charging Cable.*\$12\.99/);
});

When('the standard user selects Export CSV', async ({ standardUser, scenarioContext }) => {
  const downloadPromise = standardUser.page.waitForEvent('download');
  await standardUser.productsPage.exportCsvButton.click();
  scenarioContext.csvDownload = await downloadPromise;
});

Then("the standard user sees that a file named products-<today's date>.csv downloads", async ({ scenarioContext }) => {
  const todaysDate = new Date().toISOString().slice(0, 10);
  expect(scenarioContext.csvDownload.suggestedFilename(), "A file named products-<today's date>.csv downloads.").toBe(`products-${todaysDate}.csv`);
});

Then('the standard user sees that the file has a heading row and 10 product rows', async ({ scenarioContext }) => {
  const csvLines = (await readFile(await scenarioContext.csvDownload.path(), 'utf8')).trim().split('\n');
  expect(csvLines[0], 'The file has a heading row and 10 product rows.').toMatch(/^SKU,Name,Category/);
  expect(csvLines, 'The file has a heading row and 10 product rows.').toHaveLength(11);
});

When('the standard user selects Clear filters, chooses 25 in Rows per page, then selects the next-page arrow \\(›\\)', async ({ standardUser }) => {
  await standardUser.productsPage.clearFiltersButton.click();
  await standardUser.productsPage.rowsPerPageSelect.selectOption('25');
  await expect(standardUser.productsPage.summaryText).toHaveText(/^Showing 1–25 of /);
  await standardUser.productsPage.nextPageButton.click();
});

Then('the standard user sees that the page says "Showing 26–50 of" and the total', async ({ standardUser }) => {
  await expect(standardUser.productsPage.summaryText, 'The page says "Showing 26–50 of" and the total.').toHaveText(/^Showing 26–50 of \d+ products$/);
});

Then('the standard user sees that page 2 is marked as the current page', async ({ standardUser }) => {
  await expect(standardUser.productsPage.currentPageNumber(2), 'Page 2 is marked as the current page.').toBeVisible();
});
