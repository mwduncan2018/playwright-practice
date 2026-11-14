import { test, expect } from '@playwright/test';

// Deliberate Failure
test('navigates to Google 1', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/this-should-fail\.com/, { timeout: 1000});
  await expect(page).toHaveTitle(/Google/);
});

// Deliberate Failure
test('navigates to Google 2', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/google\.com/);
  await expect(page).toHaveTitle(/THIS_SHOULD_FAIL/, { timeout: 1000});
});

test('navigates to Google 3', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/google\.com/);
  await expect(page).toHaveTitle(/Google/);
});