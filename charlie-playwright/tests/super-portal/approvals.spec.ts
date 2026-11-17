import { expect, plan, test } from './fixtures';

test('SP-006 An admin approves a request', { tag: '@smoke', annotation: plan('SP-006') }, async ({ standardUser, adminUser }) => {
  const approvalNote = 'Approved for this quarter.';

  const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestSoftwareButton.click();
    await standardUser.softwareWizard.softwareSelect.selectOption('Tableau');
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.sixMonthsLicenseRadio.check();
    await standardUser.softwareWizard.seatsInput.fill('1');
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.reasonTextarea.fill('I build the sales dashboards each quarter.');
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.submitButton.click();
    await expect(standardUser.softwareWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
    return (await standardUser.softwareWizard.newRequestNumberText.innerText()).trim();
  });

  await test.step('2. As an admin, open Approvals.', async () => {
    await adminUser.page.goto(adminUser.approvalsPage.path);
    await expect(adminUser.approvalsPage.requestRow(requestNumber), 'The request is listed.').toBeVisible();
  });

  await test.step('3. Select Approve for the request, enter the note, and select Approve.', async () => {
    await adminUser.approvalsPage.approveButton(requestNumber).click();
    await adminUser.approveDialog.noteOrReasonTextarea.fill(approvalNote);
    await adminUser.approveDialog.confirmButton.click();
    await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Approved <number>." appears.').toContainText(`Approved ${requestNumber}.`);
    await expect(adminUser.approvalsPage.requestRow(requestNumber), 'The request is no longer listed.').toHaveCount(0);
  });

  await test.step('4. As the standard user, open the request.', async () => {
    await standardUser.page.goto(standardUser.requestPage.path + requestNumber);
    await expect(standardUser.requestPage.statusValue, 'The status is Approved.').toHaveText('Approved');
    await expect(standardUser.requestPage.decisionAlert, 'The page says the admin approved it, with the note.').toContainText(`Approved by ${adminUser.account.name}`);
    await expect(standardUser.requestPage.decisionAlert, 'The page says the admin approved it, with the note.').toContainText(`Note: ${approvalNote}`);
    await expect(standardUser.requestPage.lastHistoryListItem, 'The history ends with Approved.').toContainText('Approved');
  });
});

test('SP-007 An admin rejects a request', { tag: '@regression', annotation: plan('SP-007') }, async ({ standardUser, adminUser }) => {
  const rejectionReason = 'Ask your team lead to request access for the whole team.';

  const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestAccessButton.click();
    await standardUser.accessWizard.systemSelect.selectOption('Customer CRM');
    await standardUser.accessWizard.readOnlyAccessRadio.check();
    await standardUser.accessWizard.nextButton.click();
    await standardUser.accessWizard.reasonTextarea.fill('I need to read customer records for support tickets.');
    await standardUser.accessWizard.nextButton.click();
    await standardUser.accessWizard.submitButton.click();
    await expect(standardUser.accessWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
    return (await standardUser.accessWizard.newRequestNumberText.innerText()).trim();
  });

  await test.step('2. As an admin, open the request and select Reject.', async () => {
    await adminUser.page.goto(adminUser.requestPage.path + requestNumber);
    await adminUser.requestPage.rejectButton.click();
    await expect(adminUser.rejectDialog.dialog, 'A Reject dialog opens for the request.').toBeVisible();
    await expect(adminUser.rejectDialog.dialog, 'A Reject dialog opens for the request.').toHaveAccessibleName(`Reject ${requestNumber}`);
  });

  await test.step('3. Select Reject without entering a reason.', async () => {
    await adminUser.rejectDialog.confirmButton.click();
    await expect(adminUser.rejectDialog.dialog, 'The dialog says "Tell the requester why, in at least 5 characters."').toContainText('Tell the requester why, in at least 5 characters.');
  });

  await test.step('4. Enter the rejection reason and select Reject.', async () => {
    await adminUser.rejectDialog.noteOrReasonTextarea.fill(rejectionReason);
    await adminUser.rejectDialog.confirmButton.click();
    await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Rejected <number>." appears.').toContainText(`Rejected ${requestNumber}.`);
    await expect(adminUser.requestPage.statusValue, 'The status is Rejected, and the page shows the reason.').toHaveText('Rejected');
    await expect(adminUser.requestPage.decisionAlert, 'The status is Rejected, and the page shows the reason.').toContainText(`Reason: ${rejectionReason}`);
  });

  await test.step('5. As the standard user, open My requests and choose Rejected in Status.', async () => {
    await standardUser.page.goto(standardUser.myRequestsPage.path);
    await standardUser.myRequestsPage.statusSelect.selectOption('Rejected');
    await expect(standardUser.myRequestsPage.requestRow(requestNumber), 'The request is listed as Rejected.').toContainText('Rejected');
  });
});

test("SP-008 Admins can't decide on their own requests", { tag: '@regression', annotation: plan('SP-008') }, async ({ adminUser }) => {
  const requestNumber = await test.step('1. Submit the request in the test data.', async () => {
    await adminUser.page.goto(adminUser.newRequestPage.path);
    await adminUser.newRequestPage.requestEquipmentButton.click();
    await adminUser.equipmentWizard.itemSelect.selectOption('Headset');
    await adminUser.equipmentWizard.quantityInput.fill('1');
    await adminUser.equipmentWizard.nextButton.click();
    await adminUser.equipmentWizard.pickUpAtTheItDeskRadio.check();
    await adminUser.equipmentWizard.nextButton.click();
    await adminUser.equipmentWizard.reasonTextarea.fill("My headset's microphone stopped working.");
    await adminUser.equipmentWizard.nextButton.click();
    await adminUser.equipmentWizard.submitButton.click();
    await expect(adminUser.equipmentWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
    return (await adminUser.equipmentWizard.newRequestNumberText.innerText()).trim();
  });

  await test.step('2. Open Approvals.', async () => {
    await adminUser.page.goto(adminUser.approvalsPage.path);
    await expect(adminUser.approvalsPage.summaryText).toBeVisible();
    await expect(adminUser.approvalsPage.requestRow(requestNumber), "The request isn't listed.").toHaveCount(0);
  });

  await test.step('3. Open the request.', async () => {
    await adminUser.page.goto(adminUser.requestPage.path + requestNumber);
    await expect(adminUser.requestPage.ownRequestNoticeAlert, 'The page says "You can\'t approve or reject your own request. Another admin will decide on it."').toBeVisible();
    await expect(adminUser.requestPage.approveButton, 'There are no Approve or Reject buttons.').toHaveCount(0);
    await expect(adminUser.requestPage.rejectButton, 'There are no Approve or Reject buttons.').toHaveCount(0);
  });
});
