import { test, expect } from '../support/fixtures';

test.describe('Site navigation', () => {
  test('NAV-001 move between the documentation pages with the site menu', async ({ page }) => {
    const siteMenu = page.getByRole('navigation', { name: 'Research site' });

    await test.step('Open Data pages', async () => {
      await page.goto('/results/index.html');
      await expect(page.getByRole('heading', { level: 1, name: 'Data pages', exact: true })).toBeVisible();
    });

    await test.step('Click "Research README"', async () => {
      await siteMenu.getByRole('link', { name: 'Research README', exact: true }).click();
      await expect(page).toHaveURL(/\/README\.md$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Research', exact: true })).toBeVisible();
    });

    await test.step('Click "Strategies README"', async () => {
      await siteMenu.getByRole('link', { name: 'Strategies README', exact: true }).click();
      await expect(page).toHaveURL(/\/strategies\/README\.md$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Strategies', exact: true })).toBeVisible();
    });

    await test.step('Click "Data pages"', async () => {
      await siteMenu.getByRole('link', { name: 'Data pages', exact: true }).click();
      await expect(page).toHaveURL(/\/results\/index\.html$/);
      await expect(page.getByRole('heading', { level: 1, name: 'Data pages', exact: true })).toBeVisible();
    });
  });

  test('NAV-002 return to the index from a data page', async ({ page }) => {
    await page.goto('/results/gap_fills.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Gap fills on volatile days' })).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Research site' })
      .getByRole('link', { name: 'Data pages', exact: true })
      .click();

    await expect(page).toHaveURL(/\/results\/index\.html$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Data pages', exact: true })).toBeVisible();
  });
});
