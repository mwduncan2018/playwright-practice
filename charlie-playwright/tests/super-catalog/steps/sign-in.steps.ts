import { account } from '../../../shared/accounts';
import { expect, Then, When } from '../fixtures';

When('the signed-out user opens Super Catalog', async ({ signedOutUser }) => {
  await signedOutUser.page.goto('/');
});

Then('the signed-out user sees that Keycloak\'s sign-in page opens, with the title "Sign in to Super Apps"', async ({ signedOutUser }) => {
  await expect(signedOutUser.page, 'Keycloak\'s sign-in page opens, with the title "Sign in to Super Apps".').toHaveTitle('Sign in to Super Apps');
});

When('the signed-out user enters the username and the wrong password, then selects Sign In', async ({ signedOutUser }) => {
  const standardAccount = account('standard');
  await signedOutUser.keycloakPage.usernameInput.fill(standardAccount.username);
  await signedOutUser.keycloakPage.fillSecret(signedOutUser.keycloakPage.passwordInput, 'wrong-password');
  await signedOutUser.keycloakPage.signInButton.click();
});

Then('the signed-out user sees that the page says "Invalid username or password."', async ({ signedOutUser }) => {
  await expect(signedOutUser.keycloakPage.errorMessageText, 'The page says "Invalid username or password."').toHaveText('Invalid username or password.');
});

When('the signed-out user enters the username and the correct password, then selects Sign In', async ({ signedOutUser }) => {
  const standardAccount = account('standard');
  await signedOutUser.keycloakPage.usernameInput.fill(standardAccount.username);
  await signedOutUser.keycloakPage.fillSecret(signedOutUser.keycloakPage.passwordInput, standardAccount.password);
  await signedOutUser.keycloakPage.signInButton.click();
});

Then('the signed-out user sees that the Dashboard opens and says "Welcome, <name>." with the user\'s name', async ({ signedOutUser }) => {
  const standardAccount = account('standard');
  await expect(signedOutUser.dashboardPage.welcomeText, 'The Dashboard opens and says "Welcome, <name>." with the user\'s name.').toHaveText(`Welcome, ${standardAccount.name}.`);
});

Then("the signed-out user sees that the user's name is shown at the top right", async ({ signedOutUser }) => {
  const standardAccount = account('standard');
  await expect(signedOutUser.navbarPage.userMenuButton, "The user's name is shown at the top right.").toContainText(standardAccount.name);
});

When('the signed-out user opens the user menu and selects Sign out', async ({ signedOutUser }) => {
  await signedOutUser.navbarPage.userMenuButton.click();
  await signedOutUser.navbarPage.signOutButton.click();
});

Then("the signed-out user sees that Keycloak's sign-in page opens again", async ({ signedOutUser }) => {
  await expect(signedOutUser.keycloakPage.heading, "Keycloak's sign-in page opens again.").toBeVisible();
});
