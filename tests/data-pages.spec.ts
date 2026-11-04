import { test, expect } from '../support/fixtures';

test.describe('Data pages', () => {
  test('DATA-001 the index describes and lists the analyses', async ({ page }) => {
    await page.goto('/results/index.html');

    await expect(page.getByText('The analyses the strategies are built on')).toBeVisible();

    const main = page.getByRole('main');
    for (const name of ['Calm days', 'Gap fills', 'Streak screen']) {
      await expect(main.getByRole('link', { name, exact: true })).toBeVisible();
    }
  });

  // DATA-002 is data-driven: one test per row of the plan's table, each running in parallel.
  const rows = [
    { link: 'Buying the break of -1.0', heading: 'Buying the break of -1.0' },
    { link: 'Calm days', heading: 'Calm days' },
    { link: 'Gap fills', heading: 'Gap fills on volatile days' },
    { link: 'Morning setups', heading: 'Morning setups' },
    { link: 'Robustness of the lead strategies', heading: 'Robustness of the lead strategies' },
  ];

  for (const { link, heading } of rows) {
    test(`DATA-002 open "${link}" from the index`, async ({ page }) => {
      await page.goto('/results/index.html');
      await expect(page.getByRole('heading', { level: 1, name: 'Data pages', exact: true })).toBeVisible();

      await page.getByRole('main').getByRole('link', { name: link, exact: true }).click();

      await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
    });
  }
});
