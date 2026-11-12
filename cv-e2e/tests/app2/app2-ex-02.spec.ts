import { test, expect } from '@playwright/test';

test('navigates to Google 1', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/google\.com/);
  await expect(page).toHaveTitle(/Google/);
});

test('navigates to Google 2', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/google\.com/);
  await expect(page).toHaveTitle(/Google/);
});

test('navigates to Google 3', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/google\.com/);
  await expect(page).toHaveTitle(/Google/);
});