import { expect, plan, test } from './fixtures';

test('SP-006 An admin approves a request', { tag: '@smoke', annotation: plan('SP-006') }, async ({ standard, admin }) => {
  const note = 'Approved for this quarter.';

  const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
    await standard.page.goto(standard.newRequest.path);
    await standard.newRequest.requestSoftware.click();
    await standard.softwareWizard.software.selectOption('Tableau');
    await standard.softwareWizard.nextButton.click();
    await standard.softwareWizard.dialog.getByRole('radio', { name: '6 months', exact: true }).check();
    await standard.softwareWizard.seats.fill('1');
    await standard.softwareWizard.nextButton.click();
    await standard.softwareWizard.reason.fill('I build the sales dashboards each quarter.');
    await standard.softwareWizard.nextButton.click();
    await standard.softwareWizard.submitButton.click();
    await expect(standard.softwareWizard.newRequestNumber, "The wizard shows the new request's number.").toHaveText(
      /^REQ-\d{4,}$/,
    );
    return (await standard.softwareWizard.newRequestNumber.innerText()).trim();
  });

  await test.step('2. As an admin, open Approvals.', async () => {
    await admin.page.goto(admin.approvals.path);
    await expect(admin.approvals.row(requestNumber), 'The request is listed.').toBeVisible();
  });

  await test.step('3. Select Approve for the request, enter the note, and select Approve.', async () => {
    await admin.approvals.approveButton(requestNumber).click();
    await admin.approveDialog.text.fill(note);
    await admin.approveDialog.confirmButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Approved ${requestNumber}.` }),
      'The message "Approved <number>." appears.',
    ).toBeVisible();
    await expect(admin.approvals.row(requestNumber), 'The request is no longer listed.').toHaveCount(0);
  });

  await test.step('4. As the standard user, open the request.', async () => {
    await standard.page.goto(standard.request.path + requestNumber);
    await expect(standard.request.status, 'The status is Approved.').toHaveText('Approved');
    const approvedBy = 'The page says the admin approved it, with the note.';
    await expect(standard.request.decision, approvedBy).toContainText(`Approved by ${admin.account.name}`);
    await expect(standard.request.decision, approvedBy).toContainText(`Note: ${note}`);
    await expect(standard.request.historyEntries.last(), 'The history ends with Approved.').toContainText('Approved');
  });
});

test('SP-007 An admin rejects a request', { tag: '@regression', annotation: plan('SP-007') }, async ({ standard, admin }) => {
  const reason = 'Ask your team lead to request access for the whole team.';

  const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
    await standard.page.goto(standard.newRequest.path);
    await standard.newRequest.requestAccess.click();
    await standard.accessWizard.system.selectOption('Customer CRM');
    await standard.accessWizard.dialog.getByRole('radio', { name: 'Read only', exact: true }).check();
    await standard.accessWizard.nextButton.click();
    await standard.accessWizard.reason.fill('I need to read customer records for support tickets.');
    await standard.accessWizard.nextButton.click();
    await standard.accessWizard.submitButton.click();
    await expect(standard.accessWizard.newRequestNumber, "The wizard shows the new request's number.").toHaveText(
      /^REQ-\d{4,}$/,
    );
    return (await standard.accessWizard.newRequestNumber.innerText()).trim();
  });

  await test.step('2. As an admin, open the request and select Reject.', async () => {
    await admin.page.goto(admin.request.path + requestNumber);
    await admin.request.rejectButton.click();
    const opens = 'A Reject dialog opens for the request.';
    await expect(admin.rejectDialog.dialog, opens).toBeVisible();
    await expect(admin.rejectDialog.dialog, opens).toHaveAccessibleName(`Reject ${requestNumber}`);
  });

  await test.step('3. Select Reject without entering a reason.', async () => {
    await admin.rejectDialog.confirmButton.click();
    await expect(
      admin.rejectDialog.dialog,
      'The dialog says "Tell the requester why, in at least 5 characters."',
    ).toContainText('Tell the requester why, in at least 5 characters.');
  });

  await test.step('4. Enter the rejection reason and select Reject.', async () => {
    await admin.rejectDialog.text.fill(reason);
    await admin.rejectDialog.confirmButton.click();
    await expect(
      admin.alerts.messages.filter({ hasText: `Rejected ${requestNumber}.` }),
      'The message "Rejected <number>." appears.',
    ).toBeVisible();
    const rejected = 'The status is Rejected, and the page shows the reason.';
    await expect(admin.request.status, rejected).toHaveText('Rejected');
    await expect(admin.request.decision, rejected).toContainText(`Reason: ${reason}`);
  });

  await test.step('5. As the standard user, open My requests and choose Rejected in Status.', async () => {
    await standard.page.goto(standard.myRequests.path);
    await standard.myRequests.status.selectOption('Rejected');
    await expect(standard.myRequests.row(requestNumber), 'The request is listed as Rejected.').toContainText(
      'Rejected',
    );
  });
});

test("SP-008 Admins can't decide on their own requests", { tag: '@regression', annotation: plan('SP-008') }, async ({ admin }) => {
  const requestNumber = await test.step('1. Submit the request in the test data.', async () => {
    await admin.page.goto(admin.newRequest.path);
    await admin.newRequest.requestEquipment.click();
    await admin.equipmentWizard.item.selectOption('Headset');
    await admin.equipmentWizard.quantity.fill('1');
    await admin.equipmentWizard.nextButton.click();
    await admin.equipmentWizard.dialog.getByRole('radio', { name: 'Pick up at the IT desk', exact: true }).check();
    await admin.equipmentWizard.nextButton.click();
    await admin.equipmentWizard.reason.fill("My headset's microphone stopped working.");
    await admin.equipmentWizard.nextButton.click();
    await admin.equipmentWizard.submitButton.click();
    await expect(admin.equipmentWizard.newRequestNumber, "The wizard shows the new request's number.").toHaveText(
      /^REQ-\d{4,}$/,
    );
    return (await admin.equipmentWizard.newRequestNumber.innerText()).trim();
  });

  await test.step('2. Open Approvals.', async () => {
    await admin.page.goto(admin.approvals.path);
    // Wait for the queue, so the check below isn't made before it has loaded.
    await expect(admin.approvals.summary).toBeVisible();
    await expect(admin.approvals.row(requestNumber), "The request isn't listed.").toHaveCount(0);
  });

  await test.step('3. Open the request.', async () => {
    await admin.page.goto(admin.request.path + requestNumber);
    await expect(
      admin.alerts.messages.filter({
        hasText: "You can't approve or reject your own request. Another admin will decide on it.",
      }),
      'The page says "You can\'t approve or reject your own request. Another admin will decide on it."',
    ).toBeVisible();
    const noButtons = 'There are no Approve or Reject buttons.';
    await expect(admin.request.approveButton, noButtons).toHaveCount(0);
    await expect(admin.request.rejectButton, noButtons).toHaveCount(0);
  });
});
