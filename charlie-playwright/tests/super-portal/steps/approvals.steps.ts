import { expect, Then, When } from '../fixtures';

const approvalNote = 'Approved for this quarter.';
const rejectionReason = 'Ask your team lead to request access for the whole team.';

When('the standard user submits the Tableau request in the test data', async ({ standardUser }) => {
  await standardUser.navbarPage.newRequestLink.click();
  await standardUser.newRequestPage.requestSoftwareButton.click();
  await standardUser.softwareWizard.softwareSelect.selectOption('Tableau');
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.sixMonthsLicenseRadio.check();
  await standardUser.softwareWizard.seatsInput.fill('1');
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.reasonTextarea.fill('I build the sales dashboards each quarter.');
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.submitButton.click();
});

When('the standard user selects Done', async ({ standardUser }) => {
  await standardUser.requestWizard.doneButton.click();
});

When('the admin user opens Approvals', async ({ adminUser }) => {
  await adminUser.navbarPage.approvalsLink.click();
});

Then('the admin user sees that the request is listed', async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.approvalsPage.requestRow(scenarioContext.requestNumber), 'The request is listed.').toBeVisible();
});

When('the admin user selects Approve for the request, enters the note, and selects Approve', async ({ adminUser, scenarioContext }) => {
  await adminUser.approvalsPage.approveButton(scenarioContext.requestNumber).click();
  await adminUser.approveDialog.noteOrReasonTextarea.fill(approvalNote);
  await adminUser.approveDialog.confirmButton.click();
});

Then('the admin user sees that the message "Approved <number>." appears', async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Approved <number>." appears.').toContainText(`Approved ${scenarioContext.requestNumber}.`);
});

Then('the admin user sees that the request is no longer listed', async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.approvalsPage.requestRow(scenarioContext.requestNumber), 'The request is no longer listed.').toHaveCount(0);
});

When('the standard user opens the request', async ({ standardUser, scenarioContext }) => {
  await standardUser.navbarPage.myRequestsLink.click();
  await standardUser.myRequestsPage.searchInput.fill(scenarioContext.requestNumber);
  await standardUser.myRequestsPage.requestNumberLink(scenarioContext.requestNumber).click();
});

Then('the standard user sees that the page says the admin approved it, with the note', async ({ standardUser, adminUser }) => {
  await expect(standardUser.requestPage.decisionAlert, 'The page says the admin approved it, with the note.').toContainText(`Approved by ${adminUser.account.name}`);
  await expect(standardUser.requestPage.decisionAlert, 'The page says the admin approved it, with the note.').toContainText(`Note: ${approvalNote}`);
});

Then('the standard user sees that the history ends with Approved', async ({ standardUser }) => {
  await expect(standardUser.requestPage.lastHistoryListItem, 'The history ends with Approved.').toContainText('Approved');
});

When('the standard user submits the Customer CRM request in the test data', async ({ standardUser }) => {
  await standardUser.navbarPage.newRequestLink.click();
  await standardUser.newRequestPage.requestAccessButton.click();
  await standardUser.accessWizard.systemSelect.selectOption('Customer CRM');
  await standardUser.accessWizard.readOnlyAccessRadio.check();
  await standardUser.accessWizard.nextButton.click();
  await standardUser.accessWizard.reasonTextarea.fill('I need to read customer records for support tickets.');
  await standardUser.accessWizard.nextButton.click();
  await standardUser.accessWizard.submitButton.click();
});

When('the admin user opens the request and selects Reject', async ({ adminUser, scenarioContext }) => {
  await adminUser.navbarPage.approvalsLink.click();
  await adminUser.approvalsPage.requestNumberLink(scenarioContext.requestNumber).click();
  await adminUser.requestPage.rejectButton.click();
});

Then('the admin user sees that a Reject dialog opens for the request', async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.rejectDialog.dialog, 'A Reject dialog opens for the request.').toBeVisible();
  await expect(adminUser.rejectDialog.dialog, 'A Reject dialog opens for the request.').toHaveAccessibleName(`Reject ${scenarioContext.requestNumber}`);
});

When('the admin user selects Reject without entering a reason', async ({ adminUser }) => {
  await adminUser.rejectDialog.confirmButton.click();
});

Then('the admin user sees that the dialog says "Tell the requester why, in at least 5 characters."', async ({ adminUser }) => {
  await expect(adminUser.rejectDialog.dialog, 'The dialog says "Tell the requester why, in at least 5 characters."').toContainText('Tell the requester why, in at least 5 characters.');
});

When('the admin user enters the rejection reason and selects Reject', async ({ adminUser }) => {
  await adminUser.rejectDialog.noteOrReasonTextarea.fill(rejectionReason);
  await adminUser.rejectDialog.confirmButton.click();
});

Then('the admin user sees that the message "Rejected <number>." appears', async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Rejected <number>." appears.').toContainText(`Rejected ${scenarioContext.requestNumber}.`);
});

Then('the admin user sees that the status is Rejected, and the page shows the reason', async ({ adminUser }) => {
  await expect(adminUser.requestPage.statusValue, 'The status is Rejected, and the page shows the reason.').toHaveText('Rejected');
  await expect(adminUser.requestPage.decisionAlert, 'The status is Rejected, and the page shows the reason.').toContainText(`Reason: ${rejectionReason}`);
});

When('the standard user opens My requests and chooses Rejected in Status', async ({ standardUser }) => {
  await standardUser.navbarPage.myRequestsLink.click();
  await standardUser.myRequestsPage.statusSelect.selectOption('Rejected');
});

Then('the standard user sees that the request is listed as Rejected', async ({ standardUser, scenarioContext }) => {
  await expect(standardUser.myRequestsPage.requestRow(scenarioContext.requestNumber), 'The request is listed as Rejected.').toContainText('Rejected');
});

When('the admin user submits the headset request in the test data', async ({ adminUser }) => {
  await adminUser.navbarPage.newRequestLink.click();
  await adminUser.newRequestPage.requestEquipmentButton.click();
  await adminUser.equipmentWizard.itemSelect.selectOption('Headset');
  await adminUser.equipmentWizard.quantityInput.fill('1');
  await adminUser.equipmentWizard.nextButton.click();
  await adminUser.equipmentWizard.pickUpAtTheItDeskRadio.check();
  await adminUser.equipmentWizard.nextButton.click();
  await adminUser.equipmentWizard.reasonTextarea.fill("My headset's microphone stopped working.");
  await adminUser.equipmentWizard.nextButton.click();
  await adminUser.equipmentWizard.submitButton.click();
});

Then("the admin user sees that the wizard shows the new request's number", async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.equipmentWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
  scenarioContext.requestNumber = (await adminUser.equipmentWizard.newRequestNumberText.innerText()).trim();
});

When('the admin user selects Done', async ({ adminUser }) => {
  await adminUser.equipmentWizard.doneButton.click();
});

Then("the admin user sees that the request isn't listed", async ({ adminUser, scenarioContext }) => {
  await expect(adminUser.approvalsPage.summaryText).toBeVisible();
  await expect(adminUser.approvalsPage.requestRow(scenarioContext.requestNumber), "The request isn't listed.").toHaveCount(0);
});

When('the admin user opens the request', async ({ adminUser, scenarioContext }) => {
  await adminUser.navbarPage.myRequestsLink.click();
  await adminUser.myRequestsPage.searchInput.fill(scenarioContext.requestNumber);
  await adminUser.myRequestsPage.requestNumberLink(scenarioContext.requestNumber).click();
});

Then('the admin user sees that the page says "You can\'t approve or reject your own request. Another admin will decide on it."', async ({ adminUser }) => {
  await expect(adminUser.requestPage.ownRequestNoticeAlert, 'The page says "You can\'t approve or reject your own request. Another admin will decide on it."').toBeVisible();
});

Then('the admin user sees that there are no Approve or Reject buttons', async ({ adminUser }) => {
  await expect(adminUser.requestPage.approveButton, 'There are no Approve or Reject buttons.').toHaveCount(0);
  await expect(adminUser.requestPage.rejectButton, 'There are no Approve or Reject buttons.').toHaveCount(0);
});
