import { test, expect } from '@playwright/test';

test('navigates to Google', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/google\.com/);
  await expect(page).toHaveTitle(/Google/);
});
