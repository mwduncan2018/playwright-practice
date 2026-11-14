import { expect, plan, test } from './fixtures';

test(
  'SP-006 An admin approves a request',
  { tag: '@smoke', annotation: plan('SP-006') },
  async ({ page, portal, openPortalAs, accountFor }) => {
    const wizard = portal.softwareWizard;
    const note = 'Approved for this quarter.';

    const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
      await page.goto(portal.newRequest.path);
      await portal.newRequest.requestSoftware.click();
      await wizard.software.selectOption('Tableau');
      await wizard.nextButton.click();
      await wizard.dialog.getByRole('radio', { name: '6 months', exact: true }).check();
      await wizard.seats.fill('1');
      await wizard.nextButton.click();
      await wizard.reason.fill('I build the sales dashboards each quarter.');
      await wizard.nextButton.click();
      await wizard.submitButton.click();
      await expect(wizard.newRequestNumber, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
      return (await wizard.newRequestNumber.innerText()).trim();
    });

    const admin = await openPortalAs('admin');

    await test.step('2. As an admin, open Approvals.', async () => {
      await admin.page.goto(admin.approvals.path);
      await expect(admin.approvals.row(requestNumber), 'The request is listed.').toBeVisible();
    });

    await test.step('3. Select Approve for the request, enter the note, and select Approve.', async () => {
      await admin.approvals.approveButton(requestNumber).click();
      const dialog = admin.approvals.decisionDialog('Approve', requestNumber);
      await dialog.text.fill(note);
      await dialog.confirmButton.click();
      await expect(
        admin.layout.alerts.filter({ hasText: `Approved ${requestNumber}.` }),
        'The message "Approved <number>." appears.',
      ).toBeVisible();
      await expect(admin.approvals.row(requestNumber), 'The request is no longer listed.').toHaveCount(0);
    });

    await test.step('4. As the standard user, open the request.', async () => {
      await page.goto(portal.request.path + requestNumber);
      await expect(portal.request.status, 'The status is Approved.').toHaveText('Approved');
      const approvedBy = 'The page says the admin approved it, with the note.';
      await expect(portal.request.decision, approvedBy).toContainText(`Approved by ${accountFor('admin').name}`);
      await expect(portal.request.decision, approvedBy).toContainText(`Note: ${note}`);
      await expect(portal.request.historyEntries.last(), 'The history ends with Approved.').toContainText('Approved');
    });
  },
);

test(
  'SP-007 An admin rejects a request',
  { tag: '@regression', annotation: plan('SP-007') },
  async ({ page, portal, openPortalAs }) => {
    const wizard = portal.accessWizard;
    const reason = 'Ask your team lead to request access for the whole team.';

    const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
      await page.goto(portal.newRequest.path);
      await portal.newRequest.requestAccess.click();
      await wizard.system.selectOption('Customer CRM');
      await wizard.dialog.getByRole('radio', { name: 'Read only', exact: true }).check();
      await wizard.nextButton.click();
      await wizard.reason.fill('I need to read customer records for support tickets.');
      await wizard.nextButton.click();
      await wizard.submitButton.click();
      await expect(wizard.newRequestNumber, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
      return (await wizard.newRequestNumber.innerText()).trim();
    });

    const admin = await openPortalAs('admin');
    const dialog = admin.request.rejectDialog;

    await test.step('2. As an admin, open the request and select Reject.', async () => {
      await admin.page.goto(admin.request.path + requestNumber);
      await admin.request.rejectButton.click();
      const opens = 'A Reject dialog opens for the request.';
      await expect(dialog.dialog, opens).toBeVisible();
      await expect(dialog.dialog, opens).toHaveAccessibleName(`Reject ${requestNumber}`);
    });

    await test.step('3. Select Reject without entering a reason.', async () => {
      await dialog.confirmButton.click();
      await expect(dialog.dialog, 'The dialog says "Tell the requester why, in at least 5 characters."').toContainText(
        'Tell the requester why, in at least 5 characters.',
      );
    });

    await test.step('4. Enter the rejection reason and select Reject.', async () => {
      await dialog.text.fill(reason);
      await dialog.confirmButton.click();
      await expect(
        admin.layout.alerts.filter({ hasText: `Rejected ${requestNumber}.` }),
        'The message "Rejected <number>." appears.',
      ).toBeVisible();
      const rejected = 'The status is Rejected, and the page shows the reason.';
      await expect(admin.request.status, rejected).toHaveText('Rejected');
      await expect(admin.request.decision, rejected).toContainText(`Reason: ${reason}`);
    });

    await test.step('5. As the standard user, open My requests and choose Rejected in Status.', async () => {
      await page.goto(portal.myRequests.path);
      await portal.myRequests.status.selectOption('Rejected');
      await expect(portal.myRequests.row(requestNumber), 'The request is listed as Rejected.').toContainText(
        'Rejected',
      );
    });
  },
);

test.describe('as an admin', () => {
  test.use({ signedInAs: 'admin' });

  test(
    "SP-008 Admins can't decide on their own requests",
    { tag: '@regression', annotation: plan('SP-008') },
    async ({ page, portal }) => {
      const wizard = portal.equipmentWizard;

      const requestNumber = await test.step('1. Submit the request in the test data.', async () => {
        await page.goto(portal.newRequest.path);
        await portal.newRequest.requestEquipment.click();
        await wizard.item.selectOption('Headset');
        await wizard.quantity.fill('1');
        await wizard.nextButton.click();
        await wizard.dialog.getByRole('radio', { name: 'Pick up at the IT desk', exact: true }).check();
        await wizard.nextButton.click();
        await wizard.reason.fill("My headset's microphone stopped working.");
        await wizard.nextButton.click();
        await wizard.submitButton.click();
        await expect(wizard.newRequestNumber, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
        return (await wizard.newRequestNumber.innerText()).trim();
      });

      await test.step('2. Open Approvals.', async () => {
        await page.goto(portal.approvals.path);
        // Wait for the queue, so the check below isn't made before it has loaded.
        await expect(portal.approvals.summary).toBeVisible();
        await expect(portal.approvals.row(requestNumber), "The request isn't listed.").toHaveCount(0);
      });

      await test.step('3. Open the request.', async () => {
        await page.goto(portal.request.path + requestNumber);
        await expect(
          portal.layout.alerts.filter({
            hasText: "You can't approve or reject your own request. Another admin will decide on it.",
          }),
          'The page says "You can\'t approve or reject your own request. Another admin will decide on it."',
        ).toBeVisible();
        const noButtons = 'There are no Approve or Reject buttons.';
        await expect(portal.request.approveButton, noButtons).toHaveCount(0);
        await expect(portal.request.rejectButton, noButtons).toHaveCount(0);
      });
    },
  );
});
