import { expect, Then, When } from '../fixtures';

When('the standard side user opens the user menu and selects Settings', async ({ standardSideUser }) => {
  await standardSideUser.navbarPage.userMenuButton.click();
  await standardSideUser.navbarPage.settingsLink.click();
});

Then("the standard side user sees that the Settings page shows the user's username and the role standard", async ({ standardSideUser }) => {
  await expect(standardSideUser.settingsPage.usernameValue, "The Settings page shows the user's username and the role standard.").toHaveText(standardSideUser.account.username);
  await expect(standardSideUser.settingsPage.rolesValue, "The Settings page shows the user's username and the role standard.").toHaveText('standard');
});

When('the standard side user chooses Urgent in Default priority for new requests and selects Save settings', async ({ standardSideUser }) => {
  await standardSideUser.settingsPage.defaultPrioritySelect.selectOption('Urgent');
  await standardSideUser.settingsPage.saveButton.click();
});

Then('the standard side user sees that the message "Settings saved." appears', async ({ standardSideUser }) => {
  await expect(standardSideUser.alertsPage.settingsSavedAlert, 'The message "Settings saved." appears.').toBeVisible();
});

When('the standard side user reloads the page', async ({ standardSideUser }) => {
  await standardSideUser.page.reload();
});

Then('the standard side user sees that Default priority for new requests still shows Urgent', async ({ standardSideUser }) => {
  await expect(standardSideUser.settingsPage.defaultPrioritySelect, 'Default priority for new requests still shows Urgent.').toHaveValue('Urgent');
});

When('the standard side user opens New request, selects Request access, chooses HR records and Read only, and selects Next', async ({ standardSideUser }) => {
  await standardSideUser.navbarPage.newRequestLink.click();
  await standardSideUser.newRequestPage.requestAccessButton.click();
  await standardSideUser.accessWizard.systemSelect.selectOption('HR records');
  await standardSideUser.accessWizard.readOnlyAccessRadio.check();
  await standardSideUser.accessWizard.nextButton.click();
});

Then('the standard side user sees that the Priority and reason step has Urgent selected', async ({ standardSideUser }) => {
  await expect(standardSideUser.accessWizard.urgentPriorityRadio, 'The Priority and reason step has Urgent selected.').toBeChecked();
});

When('the standard side user closes the wizard with its X and selects Discard', async ({ standardSideUser }) => {
  await standardSideUser.accessWizard.closeButton.click();
  await standardSideUser.accessWizard.discardButton.click();
});

Then('the standard side user sees that the wizard closes', async ({ standardSideUser }) => {
  await expect(standardSideUser.accessWizard.dialog, 'The wizard closes.').toBeHidden();
});

When('the standard side user opens Settings, chooses Normal in Default priority for new requests, and selects Save settings', async ({ standardSideUser }) => {
  await standardSideUser.navbarPage.userMenuButton.click();
  await standardSideUser.navbarPage.settingsLink.click();
  await standardSideUser.settingsPage.defaultPrioritySelect.selectOption('Normal');
  await standardSideUser.settingsPage.saveButton.click();
});
