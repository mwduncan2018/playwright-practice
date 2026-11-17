import { expect, Then, When } from '../fixtures';

const defaultColumnNames = ['Number', 'Title', 'Type', 'Requester', 'Priority', 'Status', 'Submitted'];
const chosenColumnNames = ['Number', 'Title', 'Requester', 'Priority', 'Status', 'Decided by', 'Submitted'];

When('the admin user opens All requests', async ({ adminUser }) => {
  await adminUser.page.goto(adminUser.allRequestsPage.path);
});

Then("the admin user sees that the table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order", async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order.").toHaveText(defaultColumnNames);
});

When('the admin user selects Columns', async ({ adminUser }) => {
  await adminUser.allRequestsPage.columnsButton.click();
});

Then('the admin user sees that the Choose columns dialog opens', async ({ adminUser }) => {
  await expect(adminUser.columnsDialog.dialog, 'The Choose columns dialog opens.').toBeVisible();
});

Then("the admin user sees that Number is checked and can't be unchecked", async ({ adminUser }) => {
  await expect(adminUser.columnsDialog.numberColumnCheckbox, "Number is checked and can't be unchecked.").toBeChecked();
  await expect(adminUser.columnsDialog.numberColumnCheckbox, "Number is checked and can't be unchecked.").toBeDisabled();
});

Then("the admin user sees that Needed by, Updated and Decided by aren't checked", async ({ adminUser }) => {
  await expect(adminUser.columnsDialog.neededByColumnCheckbox, "Needed by, Updated and Decided by aren't checked.").not.toBeChecked();
  await expect(adminUser.columnsDialog.updatedColumnCheckbox, "Needed by, Updated and Decided by aren't checked.").not.toBeChecked();
  await expect(adminUser.columnsDialog.decidedByColumnCheckbox, "Needed by, Updated and Decided by aren't checked.").not.toBeChecked();
});

When('the admin user checks Decided by, unchecks Type, selects the up arrow \\(↑\\) for Decided by three times, and selects Save columns', async ({ adminUser }) => {
  await adminUser.columnsDialog.decidedByColumnCheckbox.check();
  await adminUser.columnsDialog.typeColumnCheckbox.uncheck();
  await adminUser.columnsDialog.moveDecidedByUpButton.click();
  await adminUser.columnsDialog.moveDecidedByUpButton.click();
  await adminUser.columnsDialog.moveDecidedByUpButton.click();
  await adminUser.columnsDialog.saveColumnsButton.click();
});

Then('the admin user sees that the dialog closes', async ({ adminUser }) => {
  await expect(adminUser.columnsDialog.dialog, 'The dialog closes.').toBeHidden();
});

Then("the admin user sees that the table's columns are Number, Title, Requester, Priority, Status, Decided by and Submitted, in that order", async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Requester, Priority, Status, Decided by and Submitted, in that order.").toHaveText(chosenColumnNames);
});

When('the admin user reloads the page', async ({ adminUser }) => {
  await adminUser.page.reload();
});

Then("the admin user sees that the table's columns are still Number, Title, Requester, Priority, Status, Decided by and Submitted", async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are still Number, Title, Requester, Priority, Status, Decided by and Submitted.").toHaveText(chosenColumnNames);
});

When('the admin user selects Columns, unchecks Decided by, and selects Cancel', async ({ adminUser }) => {
  await adminUser.allRequestsPage.columnsButton.click();
  await adminUser.columnsDialog.decidedByColumnCheckbox.uncheck();
  await adminUser.columnsDialog.cancelButton.click();
});

Then('the admin user sees that Decided by is still shown', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.columnHeaders, 'Decided by is still shown.').toContainText(['Decided by']);
});

When('the admin user selects Columns, selects Reset to default, and selects Save columns', async ({ adminUser }) => {
  await adminUser.allRequestsPage.columnsButton.click();
  await adminUser.columnsDialog.resetToDefaultButton.click();
  await adminUser.columnsDialog.saveColumnsButton.click();
});

Then("the admin user sees that the table's columns are Number, Title, Type, Requester, Priority, Status and Submitted again", async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Type, Requester, Priority, Status and Submitted again.").toHaveText(defaultColumnNames);
});

When('the standard user submits the webcam request in the test data', async ({ standardUser }) => {
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
});

When('the admin user opens All requests, selects Columns, checks Decided by, selects the down arrow \\(↓\\) for Requester twice, and selects Save columns', async ({ adminUser }) => {
  await adminUser.page.goto(adminUser.allRequestsPage.path);
  await adminUser.allRequestsPage.columnsButton.click();
  await adminUser.columnsDialog.decidedByColumnCheckbox.check();
  await adminUser.columnsDialog.moveRequesterDownButton.click();
  await adminUser.columnsDialog.moveRequesterDownButton.click();
  await adminUser.columnsDialog.saveColumnsButton.click();
});

Then("the admin user sees that the table's columns are Number, Title, Type, Priority, Status, Requester, Submitted and Decided by, in that order", async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.columnHeaders, "The table's columns are Number, Title, Type, Priority, Status, Requester, Submitted and Decided by, in that order.").toHaveText(['Number', 'Title', 'Type', 'Priority', 'Status', 'Requester', 'Submitted', 'Decided by']);
});

When("the admin user searches for the request's number", async ({ adminUser, scenarioContext }) => {
  await adminUser.allRequestsPage.searchInput.fill(scenarioContext.requestNumber);
});

Then('the admin user sees that the request is listed, with the standard user as its requester', async ({ adminUser, standardUser, scenarioContext }) => {
  await expect(adminUser.allRequestsPage.requestRow(scenarioContext.requestNumber, standardUser.account.name), 'The request is listed, with the standard user as its requester.').toBeVisible();
});

Then('the admin user sees that its Status is Submitted, and Decided by shows "—"', async ({ adminUser, standardUser, scenarioContext }) => {
  await expect(adminUser.allRequestsPage.statusCell(scenarioContext.requestNumber, standardUser.account.name), 'Its Status is Submitted, and Decided by shows "—".').toHaveText('Submitted');
  await expect(adminUser.allRequestsPage.decidedByCell(scenarioContext.requestNumber, standardUser.account.name), 'Its Status is Submitted, and Decided by shows "—".').toHaveText('—');
});

When('the admin user opens the request, selects Approve, and selects Approve in the dialog', async ({ adminUser, scenarioContext }) => {
  await adminUser.allRequestsPage.requestNumberLink(scenarioContext.requestNumber).click();
  await adminUser.requestPage.approveButton.click();
  await adminUser.approveDialog.confirmButton.click();
});

Then('the admin user sees that the status is Approved', async ({ adminUser }) => {
  await expect(adminUser.requestPage.statusValue, 'The status is Approved.').toHaveText('Approved');
});

When("the admin user opens All requests and searches for the request's number", async ({ adminUser, scenarioContext }) => {
  await adminUser.page.goto(adminUser.allRequestsPage.path);
  await adminUser.allRequestsPage.searchInput.fill(scenarioContext.requestNumber);
});

Then("the admin user sees that its Status is Approved, and Decided by shows the admin's name", async ({ adminUser, standardUser, scenarioContext }) => {
  await expect(adminUser.allRequestsPage.statusCell(scenarioContext.requestNumber, standardUser.account.name), "Its Status is Approved, and Decided by shows the admin's name.").toHaveText('Approved');
  await expect(adminUser.allRequestsPage.decidedByCell(scenarioContext.requestNumber, standardUser.account.name), "Its Status is Approved, and Decided by shows the admin's name.").toHaveText(adminUser.account.name);
});

When('the admin user opens All requests and chooses Standard Four in Requester', async ({ adminUser }) => {
  await adminUser.page.goto(adminUser.allRequestsPage.path);
  await adminUser.allRequestsPage.requesterSelect.selectOption('Standard Four');
});

Then('the admin user sees that the page says "Showing 1–10 of 13 requests"', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 1–10 of 13 requests".').toHaveText('Showing 1–10 of 13 requests');
});

When('the admin user selects the next-page arrow \\(›\\)', async ({ adminUser }) => {
  await adminUser.allRequestsPage.nextPageButton.click();
});

Then('the admin user sees that the page says "Showing 11–13 of 13 requests"', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 11–13 of 13 requests".').toHaveText('Showing 11–13 of 13 requests');
});

Then('the admin user sees that page 2 is marked as the current page', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.currentPageNumber(2), 'Page 2 is marked as the current page.').toBeVisible();
});

When('the admin user chooses Submitted in Status', async ({ adminUser }) => {
  await adminUser.allRequestsPage.statusSelect.selectOption('Submitted');
});

Then('the admin user sees that the page says "Showing 1–1 of 1 request"', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 1–1 of 1 request".').toHaveText('Showing 1–1 of 1 request');
});

Then('the admin user sees that the only request listed is REQ-1098, Customer CRM: Read only', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.requestRows, 'The only request listed is REQ-1098, Customer CRM: Read only.').toHaveCount(1);
  await expect(adminUser.allRequestsPage.titleCell('REQ-1098', 'Standard Four'), 'The only request listed is REQ-1098, Customer CRM: Read only.').toHaveText('Customer CRM: Read only');
});

When('the admin user selects Clear filters', async ({ adminUser }) => {
  await adminUser.allRequestsPage.clearFiltersButton.click();
});

Then('the admin user sees that Requester shows Everyone and Status shows All statuses', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.requesterSelect, 'Requester shows Everyone and Status shows All statuses.').toHaveValue('');
  await expect(adminUser.allRequestsPage.statusSelect, 'Requester shows Everyone and Status shows All statuses.').toHaveValue('');
});

Then('the admin user sees that the page says "Showing 1–10 of" and the total', async ({ adminUser }) => {
  await expect(adminUser.allRequestsPage.summaryText, 'The page says "Showing 1–10 of" and the total.').toHaveText(/^Showing 1–10 of \d+ requests$/);
});

When('the standard user opens Home and looks at the menu at the top of the page', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.homePage.path);
});

Then("the standard user sees that there's no All requests link", async ({ standardUser }) => {
  await expect(standardUser.navbarPage.userMenuButton).toBeVisible();
  await expect(standardUser.navbarPage.allRequestsLink, "There's no All requests link.").toHaveCount(0);
});

When('the standard user goes to the address \\/all-requests', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.allRequestsPage.path);
});

Then('the standard user sees that the page says "You don\'t have access to this page"', async ({ standardUser }) => {
  await expect(standardUser.accessDeniedPage.heading, 'The page says "You don\'t have access to this page".').toBeVisible();
});
