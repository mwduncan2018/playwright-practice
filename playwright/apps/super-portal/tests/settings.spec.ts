import { expect, plan, test } from '../fixtures';

test(
  "SP-010 Settings set the wizard's default priority",
  { tag: '@regression', annotation: plan('SP-010') },
  async ({ page, portal, user }) => {
    const { settings } = portal;
    const wizard = portal.accessWizard;

    await test.step('1. Open the user menu and select Settings.', async () => {
      await portal.home.goto();
      await portal.layout.openSettings(user.name);
      const shows = "The Settings page shows the user's username and the role standard.";
      await expect(settings.username, shows).toHaveText(user.username);
      await expect(settings.roles, shows).toHaveText('standard');
    });

    await test.step('2. Choose Urgent in Default priority for new requests and select Save settings.', async () => {
      await settings.defaultPriority.selectOption('Urgent');
      await settings.saveButton.click();
      await expect(portal.layout.message('Settings saved.'), 'The message "Settings saved." appears.').toBeVisible();
    });

    await test.step('3. Reload the page.', async () => {
      await page.reload();
      await expect(settings.defaultPriority, 'Default priority for new requests still shows Urgent.').toHaveValue(
        'Urgent',
      );
    });

    await test.step('4. Open New request, select Request access, choose HR records and Read only, and select Next.', async () => {
      await portal.newRequest.goto();
      await portal.newRequest.requestAccess.click();
      await wizard.system.selectOption('HR records');
      await wizard.option('Read only').check();
      await wizard.nextButton.click();
      await expect(wizard.option('Urgent'), 'The Priority and reason step has Urgent selected.').toBeChecked();
    });

    await test.step('5. Close the wizard with its X and select Discard.', async () => {
      await wizard.closeButton.click();
      await wizard.discardButton.click();
      await expect(wizard.dialog, 'The wizard closes.').toBeHidden();
    });

    await test.step('6. Open Settings, choose Normal in Default priority for new requests, and select Save settings.', async () => {
      await settings.goto();
      await settings.defaultPriority.selectOption('Normal');
      await settings.saveButton.click();
      await expect(portal.layout.message('Settings saved.'), 'The message "Settings saved." appears.').toBeVisible();
    });
  },
);
