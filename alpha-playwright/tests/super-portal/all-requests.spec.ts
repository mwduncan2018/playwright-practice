import { expect, plan, test } from './fixtures';

test('SP-011 Choose and order the All requests columns', { tag: '@regression', annotation: plan('SP-011') }, async ({ adminUser }) => {
  const defaultColumnNames = ['Number', 'Title', 'Type', 'Requester', 'Priority', 'Status', 'Submitted'];
  const chosenColumnNames = ['Number', 'Title', 'Requester', 'Priority', 'Status', 'Decided by', 'Submitted'];

  await test.step('1. Open All requests.', async () => {
    await adminUser.page.goto(adminUser.allRequestsPage.path);
    await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order.").toHaveText(defaultColumnNames);
  });

  await test.step('2. Select Columns.', async () => {
    await adminUser.allRequestsPage.columnsButton.click();
    await expect(adminUser.columnsDialog.dialog, 'The Choose columns dialog opens.').toBeVisible();
    await expect(adminUser.columnsDialog.numberColumnCheckbox, "Number is checked and can't be unchecked.").toBeChecked();
    await expect(adminUser.columnsDialog.numberColumnCheckbox, "Number is checked and can't be unchecked.").toBeDisabled();
    const expectedResult = "Needed by, Updated and Decided by aren't checked.";
    await expect(adminUser.columnsDialog.neededByColumnCheckbox, expectedResult).not.toBeChecked();
    await expect(adminUser.columnsDialog.updatedColumnCheckbox, expectedResult).not.toBeChecked();
    await expect(adminUser.columnsDialog.decidedByColumnCheckbox, expectedResult).not.toBeChecked();
  });

  await test.step('3. Check Decided by, uncheck Type, select the up arrow (↑) for Decided by three times, and select Save columns.', async () => {
    await adminUser.columnsDialog.decidedByColumnCheckbox.check();
    await adminUser.columnsDialog.typeColumnCheckbox.uncheck();
    await adminUser.columnsDialog.moveDecidedByUpButton.click();
    await adminUser.columnsDialog.moveDecidedByUpButton.click();
    await adminUser.columnsDialog.moveDecidedByUpButton.click();
    await adminUser.columnsDialog.saveColumnsButton.click();
    await expect(adminUser.columnsDialog.dialog, 'The dialog closes.').toBeHidden();
    await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Requester, Priority, Status, Decided by and Submitted, in that order.").toHaveText(chosenColumnNames);
  });

  await test.step('4. Reload the page.', async () => {
    await adminUser.page.reload();
    await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are still Number, Title, Requester, Priority, Status, Decided by and Submitted.").toHaveText(chosenColumnNames);
  });

  await test.step('5. Select Columns, uncheck Decided by, and select Cancel.', async () => {
    await adminUser.allRequestsPage.columnsButton.click();
    await adminUser.columnsDialog.decidedByColumnCheckbox.uncheck();
    await adminUser.columnsDialog.cancelButton.click();
    await expect(adminUser.columnsDialog.dialog, 'The dialog closes.').toBeHidden();
    await expect(adminUser.allRequestsPage.columnHeaders, 'Decided by is still shown.').toContainText(['Decided by']);
  });

  await test.step('6. Select Columns, select Reset to default, and select Save columns.', async () => {
    await adminUser.allRequestsPage.columnsButton.click();
    await adminUser.columnsDialog.resetToDefaultButton.click();
    await adminUser.columnsDialog.saveColumnsButton.click();
    await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Type, Requester, Priority, Status and Submitted again.").toHaveText(defaultColumnNames);
  });
});

test('SP-012 Find a request on All requests and check who decided it', { tag: '@regression', annotation: plan('SP-012') }, async ({ standardUser, adminUser }) => {
  const requestNumber = await test.step('1. As the standard user, submit the request in the test data.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestEquipmentButton.click();
    await standardUser.equipmentWizard.itemSelect.selectOption('Webcam');
    await standardUser.equipmentWizard.quantityInput.fill('1');
    await standardUser.equipmentWizard.nextButton.click();
    await standardUser.equipmentWizard.deliverToMyDeskRadio.check();
    await standardUser.equipmentWizard.nextButton.click();
    await standardUser.equipmentWizard.reasonTextarea.fill("My laptop's camera is too dark for video calls.");
    await standardUser.equipmentWizard.nextButton.click();
    await standardUser.equipmentWizard.submitButton.click();
    await expect(standardUser.equipmentWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
    return (await standardUser.equipmentWizard.newRequestNumberText.innerText()).trim();
  });

  await test.step('2. As an admin, open All requests, select Columns, check Decided by, select the down arrow (↓) for Requester twice, and select Save columns.', async () => {
    await adminUser.page.goto(adminUser.allRequestsPage.path);
    await adminUser.allRequestsPage.columnsButton.click();
    await adminUser.columnsDialog.decidedByColumnCheckbox.check();
    await adminUser.columnsDialog.moveRequesterDownButton.click();
    await adminUser.columnsDialog.moveRequesterDownButton.click();
    await adminUser.columnsDialog.saveColumnsButton.click();
    await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Type, Priority, Status, Requester, Submitted and Decided by, in that order.").toHaveText(['Number', 'Title', 'Type', 'Priority', 'Status', 'Requester', 'Submitted', 'Decided by']);
  });

  await test.step("3. Search for the request's number.", async () => {
    await adminUser.allRequestsPage.searchInput.fill(requestNumber);
    await expect(adminUser.allRequestsPage.requestRow(requestNumber, standardUser.account.name), 'The request is listed, with the standard user as its requester.').toBeVisible();
    const expectedResult = 'Its Status is Submitted, and Decided by shows "—".';
    await expect(adminUser.allRequestsPage.statusCell(requestNumber, standardUser.account.name), expectedResult).toHaveText('Submitted');
    await expect(adminUser.allRequestsPage.decidedByCell(requestNumber, standardUser.account.name), expectedResult).toHaveText('—');
  });

  await test.step('4. Open the request, select Approve, and select Approve in the dialog.', async () => {
    await adminUser.allRequestsPage.requestNumberLink(requestNumber).click();
    await adminUser.requestPage.approveButton.click();
    await adminUser.approveDialog.confirmButton.click();
    await expect(adminUser.alertsPage.newestAlertMessage, 'The message "Approved <number>." appears.').toContainText(`Approved ${requestNumber}.`);
    await expect(adminUser.requestPage.statusValue, 'The status is Approved.').toHaveText('Approved');
  });

  await test.step("5. Open All requests and search for the request's number.", async () => {
    await adminUser.page.goto(adminUser.allRequestsPage.path);
    await adminUser.allRequestsPage.searchInput.fill(requestNumber);
    const expectedResult = "Its Status is Approved, and Decided by shows the admin's name.";
    await expect(adminUser.allRequestsPage.statusCell(requestNumber, standardUser.account.name), expectedResult).toHaveText('Approved');
    await expect(adminUser.allRequestsPage.decidedByCell(requestNumber, standardUser.account.name), expectedResult).toHaveText(adminUser.account.name);
  });
});

test('SP-013 Filter and page through All requests', { tag: '@regression', annotation: plan('SP-013') }, async ({ adminUser }) => {
  await test.step('1. Open All requests and choose Standard Four in Requester.', async () => {
    await adminUser.page.goto(adminUser.allRequestsPage.path);
    await adminUser.allRequestsPage.requesterSelect.selectOption('Standard Four');
    await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 1–10 of 13 requests".').toHaveText('Showing 1–10 of 13 requests');
  });

  await test.step('2. Select the next-page arrow (›).', async () => {
    await adminUser.allRequestsPage.nextPageButton.click();
    await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 11–13 of 13 requests".').toHaveText('Showing 11–13 of 13 requests');
    await expect(adminUser.allRequestsPage.currentPageNumber(2), 'Page 2 is marked as the current page.').toBeVisible();
  });

  await test.step('3. Choose Submitted in Status.', async () => {
    await adminUser.allRequestsPage.statusSelect.selectOption('Submitted');
    await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 1–1 of 1 request".').toHaveText('Showing 1–1 of 1 request');
    const expectedResult = 'The only request listed is REQ-1098, Customer CRM: Read only.';
    await expect(adminUser.allRequestsPage.requestRows, expectedResult).toHaveCount(1);
    await expect(adminUser.allRequestsPage.titleCell('REQ-1098', 'Standard Four'), expectedResult).toHaveText('Customer CRM: Read only');
  });

  await test.step('4. Select Clear filters.', async () => {
    await adminUser.allRequestsPage.clearFiltersButton.click();
    const expectedResult = 'Requester shows Everyone and Status shows All statuses.';
    await expect(adminUser.allRequestsPage.requesterSelect, expectedResult).toHaveValue('');
    await expect(adminUser.allRequestsPage.statusSelect, expectedResult).toHaveValue('');
    await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 1–10 of" and the total.').toHaveText(/^Showing 1–10 of \d+ requests$/);
  });
});

test("SP-014 Standard users can't open All requests", { tag: '@regression', annotation: plan('SP-014') }, async ({ standardUser }) => {
  await test.step('1. Open Home and look at the menu at the top of the page.', async () => {
    await standardUser.page.goto(standardUser.homePage.path);
    await expect(standardUser.navbarPage.userMenuButton).toBeVisible();
    await expect(standardUser.navbarPage.allRequestsLink, "There's no All requests link.").toHaveCount(0);
  });

  await test.step('2. Go to the address /all-requests.', async () => {
    await standardUser.page.goto(standardUser.allRequestsPage.path);
    await expect(standardUser.accessDeniedPage.heading, 'The page says "You don\'t have access to this page".').toBeVisible();
  });
});
