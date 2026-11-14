import { expect, plan, test } from './fixtures';

// This test signs in through Keycloak itself, so its page starts signed out. It also types a
// password, and a trace records what's typed and sent, so it records no trace. A failure still gets
// a screenshot, which shows the password as dots.
test.use({ signedInAs: 'nobody', trace: 'off' });

test(
  'SC-001 Sign in and sign out',
  { tag: '@smoke', annotation: plan('SC-001') },
  async ({ page, keycloak, catalog, user }) => {
    await test.step('1. Open Super Catalog.', async () => {
      await page.goto('/');
      await expect(page, 'Keycloak\'s sign-in page opens, with the title "Sign in to Super Apps".').toHaveTitle(
        'Sign in to Super Apps',
      );
    });

    await test.step('2. Enter the username and the wrong password, then select Sign In.', async () => {
      await keycloak.signIn(user.username, 'wrong-password');
      await expect(keycloak.errorMessage, 'The page says "Invalid username or password."').toHaveText(
        'Invalid username or password.',
      );
    });

    await test.step('3. Enter the username and the correct password, then select Sign In.', async () => {
      await keycloak.signIn(user.username, user.password);
      await expect(
        catalog.dashboard.welcome(user.name),
        'The Dashboard opens and says "Welcome, <name>." with the user\'s name.',
      ).toBeVisible();
      await expect(catalog.layout.userMenu(user.name), "The user's name is shown at the top right.").toBeVisible();
    });

    await test.step('4. Open the user menu and select Sign out.', async () => {
      await catalog.layout.signOut(user.name);
      await expect(keycloak.heading, "Keycloak's sign-in page opens again.").toBeVisible();
    });
  },
);
