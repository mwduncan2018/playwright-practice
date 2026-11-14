/**
 * The setup project: runs before the tests and signs in every account once, saving each session
 * for the tests to start from. See ACCOUNTS in accounts.ts.
 */
import { test as setup } from '@playwright/test';

import { account, ACCOUNT_NAMES, passwordVariable, sessionFile } from './accounts';
import { fillSecret } from './fill-secret';
import { KeycloakPage } from './keycloak.page';

// Signing in types passwords, and a trace records what's typed and sent, so this records no trace.
setup.use({ trace: 'off' });

for (const accountName of ACCOUNT_NAMES) {
  setup(`sign in as ${accountName}`, async ({ page, baseURL }) => {
    const { username, password } = account(accountName);
    await page.goto('/');
    const keycloak = new KeycloakPage(page);
    // Keycloak's address isn't configured here, because the app redirects to it. So this is where a
    // Keycloak that's down shows up.
    await keycloak.username.waitFor({ timeout: 15_000 }).catch(() => {
      throw new Error(`${baseURL} didn't open Keycloak's sign-in page. Is Keycloak running?`);
    });
    await keycloak.username.fill(username);
    await fillSecret(keycloak.password, password);
    await keycloak.signInButton.click();

    // Wait to be back on the app, or for Keycloak to say why not, such as a wrong password.
    const appOrigin = new URL(baseURL!).origin;
    const outcome = await Promise.race([
      page.waitForURL((url) => url.origin === appOrigin, { timeout: 15_000 }).then(() => 'signed in' as const),
      keycloak.errorMessage.waitFor({ timeout: 15_000 }).then(() => 'refused' as const),
    ]).catch(() => 'no answer' as const);
    if (outcome !== 'signed in') {
      const message = outcome === 'refused' ? await keycloak.errorMessage.innerText().catch(() => null) : null;
      throw new Error(
        `Couldn't sign in to ${baseURL} as ${username}` +
          (message ? `: Keycloak says "${message.trim()}"` : '') +
          `. Check ${passwordVariable(username)}.`,
      );
    }

    await page.context().storageState({ path: sessionFile(accountName) });
  });
}
