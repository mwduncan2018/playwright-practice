import { expect, plan, test } from './fixtures';

// This test changes the user's own settings, so it uses standardSideUser, on a side account, rather than a
// shared one. Its @side-account tag runs it in the project that runs one test at a time.
test("SP-010 Settings set the wizard's default priority", { tag: ['@regression', '@side-account'], annotation: plan('SP-010') }, async ({ standardSideUser }) => {
  await test.step('1. Open the user menu and select Settings.', async () => {
    await standardSideUser.page.goto(standardSideUser.homePage.path);
    await standardSideUser.navbarPage.menu.getByRole('button', { name: standardSideUser.account.name }).click();
    await standardSideUser.navbarPage.settingsItem.click();
    const expectedResult = "The Settings page shows the user's username and the role standard.";
    await expect(standardSideUser.settingsPage.username, expectedResult).toHaveText(standardSideUser.account.username);
    await expect(standardSideUser.settingsPage.roles, expectedResult).toHaveText('standard');
  });

  await test.step('2. Choose Urgent in Default priority for new requests and select Save settings.', async () => {
    await standardSideUser.settingsPage.defaultPriority.selectOption('Urgent');
    await standardSideUser.settingsPage.saveButton.click();
    await expect(
      standardSideUser.alertsPage.messages.filter({ hasText: 'Settings saved.' }),
      'The message "Settings saved." appears.',
    ).toBeVisible();
  });

  await test.step('3. Reload the page.', async () => {
    await standardSideUser.page.reload();
    await expect(
      standardSideUser.settingsPage.defaultPriority,
      'Default priority for new requests still shows Urgent.',
    ).toHaveValue('Urgent');
  });

  await test.step('4. Open New request, select Request access, choose HR records and Read only, and select Next.', async () => {
    await standardSideUser.page.goto(standardSideUser.newRequestPage.path);
    await standardSideUser.newRequestPage.requestAccess.click();
    await standardSideUser.accessWizard.system.selectOption('HR records');
    await standardSideUser.accessWizard.dialog.getByRole('radio', { name: 'Read only', exact: true }).check();
    await standardSideUser.accessWizard.nextButton.click();
    await expect(
      standardSideUser.accessWizard.dialog.getByRole('radio', { name: 'Urgent', exact: true }),
      'The Priority and reason step has Urgent selected.',
    ).toBeChecked();
  });

  await test.step('5. Close the wizard with its X and select Discard.', async () => {
    await standardSideUser.accessWizard.closeButton.click();
    await standardSideUser.accessWizard.discardButton.click();
    await expect(standardSideUser.accessWizard.dialog, 'The wizard closes.').toBeHidden();
  });

  await test.step('6. Open Settings, choose Normal in Default priority for new requests, and select Save settings.', async () => {
    await standardSideUser.page.goto(standardSideUser.settingsPage.path);
    await standardSideUser.settingsPage.defaultPriority.selectOption('Normal');
    await standardSideUser.settingsPage.saveButton.click();
    await expect(
      standardSideUser.alertsPage.messages.filter({ hasText: 'Settings saved.' }),
      'The message "Settings saved." appears.',
    ).toBeVisible();
  });
});
