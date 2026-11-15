import { expect, plan, test } from './fixtures';

// This test changes the user's own settings, so it uses the standardSide account rather than a
// shared one. Its @side-account tag runs it in the project that runs one test at a time.
test("SP-010 Settings set the wizard's default priority", { tag: ['@regression', '@side-account'], annotation: plan('SP-010') }, async ({ standardSide }) => {
  await test.step('1. Open the user menu and select Settings.', async () => {
    await standardSide.page.goto(standardSide.home.path);
    await standardSide.navbar.menu.getByRole('button', { name: standardSide.account.name }).click();
    await standardSide.navbar.settingsItem.click();
    const shows = "The Settings page shows the user's username and the role standard.";
    await expect(standardSide.settings.username, shows).toHaveText(standardSide.account.username);
    await expect(standardSide.settings.roles, shows).toHaveText('standard');
  });

  await test.step('2. Choose Urgent in Default priority for new requests and select Save settings.', async () => {
    await standardSide.settings.defaultPriority.selectOption('Urgent');
    await standardSide.settings.saveButton.click();
    await expect(
      standardSide.alerts.messages.filter({ hasText: 'Settings saved.' }),
      'The message "Settings saved." appears.',
    ).toBeVisible();
  });

  await test.step('3. Reload the page.', async () => {
    await standardSide.page.reload();
    await expect(
      standardSide.settings.defaultPriority,
      'Default priority for new requests still shows Urgent.',
    ).toHaveValue('Urgent');
  });

  await test.step('4. Open New request, select Request access, choose HR records and Read only, and select Next.', async () => {
    await standardSide.page.goto(standardSide.newRequest.path);
    await standardSide.newRequest.requestAccess.click();
    await standardSide.accessWizard.system.selectOption('HR records');
    await standardSide.accessWizard.dialog.getByRole('radio', { name: 'Read only', exact: true }).check();
    await standardSide.accessWizard.nextButton.click();
    await expect(
      standardSide.accessWizard.dialog.getByRole('radio', { name: 'Urgent', exact: true }),
      'The Priority and reason step has Urgent selected.',
    ).toBeChecked();
  });

  await test.step('5. Close the wizard with its X and select Discard.', async () => {
    await standardSide.accessWizard.closeButton.click();
    await standardSide.accessWizard.discardButton.click();
    await expect(standardSide.accessWizard.dialog, 'The wizard closes.').toBeHidden();
  });

  await test.step('6. Open Settings, choose Normal in Default priority for new requests, and select Save settings.', async () => {
    await standardSide.page.goto(standardSide.settings.path);
    await standardSide.settings.defaultPriority.selectOption('Normal');
    await standardSide.settings.saveButton.click();
    await expect(
      standardSide.alerts.messages.filter({ hasText: 'Settings saved.' }),
      'The message "Settings saved." appears.',
    ).toBeVisible();
  });
});
