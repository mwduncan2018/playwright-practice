import { account } from '../../shared/accounts';
import { fillSecret } from '../../shared/fill-secret';
import { expect, plan, test } from './fixtures';

// This test signs in through Keycloak itself, so it starts signed out. It also types a password,
// and a trace records what's typed and sent, so it records no trace. A failure still gets a
// screenshot, which shows the password as dots.
test.use({ trace: 'off' });

test('SC-001 Sign in and sign out', { tag: '@smoke', annotation: plan('SC-001') }, async ({ signedOutUser }) => {
  // The account the test signs in with.
  const standardAccount = account('standard');

  await test.step('1. Open Super Catalog.', async () => {
    await signedOutUser.page.goto('/');
    await expect(signedOutUser.page, 'Keycloak\'s sign-in page opens, with the title "Sign in to Super Apps".').toHaveTitle(
      'Sign in to Super Apps',
    );
  });

  await test.step('2. Enter the username and the wrong password, then select Sign In.', async () => {
    await signedOutUser.keycloakPage.usernameInput.fill(standardAccount.username);
    await fillSecret(signedOutUser.keycloakPage.passwordInput, 'wrong-password');
    await signedOutUser.keycloakPage.signInButton.click();
    await expect(signedOutUser.keycloakPage.errorMessageText, 'The page says "Invalid username or password."').toHaveText(
      'Invalid username or password.',
    );
  });

  await test.step('3. Enter the username and the correct password, then select Sign In.', async () => {
    await signedOutUser.keycloakPage.usernameInput.fill(standardAccount.username);
    await fillSecret(signedOutUser.keycloakPage.passwordInput, standardAccount.password);
    await signedOutUser.keycloakPage.signInButton.click();
    await expect(
      signedOutUser.page.getByText(`Welcome, ${standardAccount.name}.`),
      'The Dashboard opens and says "Welcome, <name>." with the user\'s name.',
    ).toBeVisible();
    await expect(
      signedOutUser.navbarPage.navigationBar.getByRole('button', { name: standardAccount.name }),
      "The user's name is shown at the top right.",
    ).toBeVisible();
  });

  await test.step('4. Open the user menu and select Sign out.', async () => {
    await signedOutUser.navbarPage.navigationBar.getByRole('button', { name: standardAccount.name }).click();
    await signedOutUser.navbarPage.signOutButton.click();
    await expect(signedOutUser.keycloakPage.heading, "Keycloak's sign-in page opens again.").toBeVisible();
  });
});
