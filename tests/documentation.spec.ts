import { test, expect } from '../support/fixtures';

test.describe('Documentation', () => {
  test('DOC-001 the Research README says where things stand', async ({ page }) => {
    await page.goto('/README.md');

    await expect(page.getByRole('heading', { level: 1, name: 'Research', exact: true })).toBeVisible();
    // The heading carries the build date ("Where things stand - 2026-11-04"), so match its start only.
    await expect(page.getByRole('heading', { level: 2, name: /^Where things stand/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Pipeline', exact: true })).toBeVisible();
  });

  test('DOC-002 the Strategies README explains how to add a strategy', async ({ page }) => {
    await page.goto('/strategies/README.md');

    await expect(page.getByRole('heading', { level: 1, name: 'Strategies', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Universe names', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Adding one', exact: true })).toBeVisible();
  });
});
