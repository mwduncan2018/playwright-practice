import { test, expect } from '@playwright/test';

// Deliberate Failure
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/FAILURE/, { timeout: 1000});
});

// Deliberate Failiure
test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'FAILIURE' })).toBeVisible({ timeout: 1000});
});
