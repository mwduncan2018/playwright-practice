import { expect, Then, When } from '../fixtures';

When('the standard user opens the Products page', async ({ standardUser }) => {
  await standardUser.navbarPage.productsLink.click();
});

Then("the standard user sees that there's no New product button", async ({ standardUser }) => {
  await expect(standardUser.productsPage.firstProductRow).toBeVisible();
  await expect(standardUser.productsPage.newProductLink, "There's no New product button.").toHaveCount(0);
});

When('the standard user opens Adjustable Dumbbells', async ({ standardUser }) => {
  await standardUser.productsPage.adjustableDumbbellsLink.click();
});

Then("the standard user sees that the product's page shows SKU SPO-1002", async ({ standardUser }) => {
  await expect(standardUser.productPage.skuValue, "The product's page shows SKU SPO-1002.").toHaveText('SPO-1002');
});

Then('the standard user sees that there are no Edit or Delete buttons', async ({ standardUser }) => {
  await expect(standardUser.productPage.editLink, 'There are no Edit or Delete buttons.').toHaveCount(0);
  await expect(standardUser.productPage.deleteButton, 'There are no Edit or Delete buttons.').toHaveCount(0);
});

When('the standard user goes to the address \\/products\\/new', async ({ standardUser }) => {
  await standardUser.page.goto('/products/new');
});

Then('the standard user sees that the page says "You don\'t have access to this page"', async ({ standardUser }) => {
  await expect(standardUser.accessDeniedPage.heading, 'The page says "You don\'t have access to this page".').toBeVisible();
});

When('the standard user looks at the menu at the top of the page', async () => {});

Then("the standard user sees that there's no Activity log link", async ({ standardUser }) => {
  await expect(standardUser.navbarPage.activityLogLink, "There's no Activity log link.").toHaveCount(0);
});
