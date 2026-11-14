import { test, expect } from '@playwright/test';

// One retry for the tests in this file, so a test that fails and then passes shows as flaky.
test.describe.configure({ retries: 1 });

// Deliberate Failure
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/FAILURE/, { timeout: 1000});
});

// Deliberate Flaky: fails on the first try, passes on the retry
test('get started link', async ({ page }, testInfo) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  expect(testInfo.retry, 'Fails on purpose on the first try').toBeGreaterThan(0);
});
