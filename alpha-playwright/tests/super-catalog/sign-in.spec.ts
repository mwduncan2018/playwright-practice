import { account } from '../../shared/accounts';
import { fillSecret } from '../../shared/fill-secret';
import { expect, plan, test } from './fixtures';

// This test signs in through Keycloak itself, so it starts signed out. It also types a password,
// and a trace records what's typed and sent, so it records no trace. A failure still gets a
// screenshot, which shows the password as dots.
test.use({ trace: 'off' });

test('SC-001 Sign in and sign out', { tag: '@smoke', annotation: plan('SC-001') }, async ({ signedOut }) => {
  // The account the test signs in with.
  const user = account('standard');

  await test.step('1. Open Super Catalog.', async () => {
    await signedOut.page.goto('/');
    await expect(signedOut.page, 'Keycloak\'s sign-in page opens, with the title "Sign in to Super Apps".').toHaveTitle(
      'Sign in to Super Apps',
    );
  });

  await test.step('2. Enter the username and the wrong password, then select Sign In.', async () => {
    await signedOut.keycloak.username.fill(user.username);
    await fillSecret(signedOut.keycloak.password, 'wrong-password');
    await signedOut.keycloak.signInButton.click();
    await expect(signedOut.keycloak.errorMessage, 'The page says "Invalid username or password."').toHaveText(
      'Invalid username or password.',
    );
  });

  await test.step('3. Enter the username and the correct password, then select Sign In.', async () => {
    await signedOut.keycloak.username.fill(user.username);
    await fillSecret(signedOut.keycloak.password, user.password);
    await signedOut.keycloak.signInButton.click();
    await expect(
      signedOut.page.getByText(`Welcome, ${user.name}.`),
      'The Dashboard opens and says "Welcome, <name>." with the user\'s name.',
    ).toBeVisible();
    await expect(
      signedOut.navbar.menu.getByRole('button', { name: user.name }),
      "The user's name is shown at the top right.",
    ).toBeVisible();
  });

  await test.step('4. Open the user menu and select Sign out.', async () => {
    await signedOut.navbar.menu.getByRole('button', { name: user.name }).click();
    await signedOut.navbar.signOutItem.click();
    await expect(signedOut.keycloak.heading, "Keycloak's sign-in page opens again.").toBeVisible();
  });
});
