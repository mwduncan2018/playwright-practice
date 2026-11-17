import { expect, Then, When } from '../fixtures';

const deliveryAddress = '500 Market Street, Seattle, WA 98101';
const monitorRequestReason = 'Two monitors for my new desk in the Seattle office.';

When('the standard user opens New request and selects Request equipment', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.newRequestPage.path);
  await standardUser.newRequestPage.requestEquipmentButton.click();
});

Then('the standard user sees that the Request equipment wizard opens at "Step 1 of 4"', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.progressText, 'The Request equipment wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
});

When('the standard user selects Next without choosing anything', async ({ standardUser }) => {
  await standardUser.equipmentWizard.nextButton.click();
});

Then('the standard user sees that Item says "Choose an item."', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.itemSelect, 'Item says "Choose an item."').toHaveAccessibleErrorMessage('Choose an item.');
});

Then('the standard user sees that the wizard stays at "Step 1 of 4"', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.progressText, 'The wizard stays at "Step 1 of 4".').toHaveText('Step 1 of 4');
});

When('the standard user chooses the item and quantity, then selects Next', async ({ standardUser }) => {
  await standardUser.equipmentWizard.itemSelect.selectOption('Monitor');
  await standardUser.equipmentWizard.quantityInput.fill('2');
  await standardUser.equipmentWizard.nextButton.click();
});

Then('the standard user sees that the Delivery step opens at "Step 2 of 4"', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.progressText, 'The Delivery step opens at "Step 2 of 4".').toHaveText('Step 2 of 4');
});

When('the standard user chooses Ship to an address and selects Next without entering an address', async ({ standardUser }) => {
  await standardUser.equipmentWizard.shipToAnAddressRadio.check();
  await standardUser.equipmentWizard.nextButton.click();
});

Then('the standard user sees that Delivery address says "Enter the full delivery address."', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.deliveryAddressTextarea, 'Delivery address says "Enter the full delivery address."').toHaveAccessibleErrorMessage('Enter the full delivery address.');
});

When('the standard user enters the address and selects Next', async ({ standardUser }) => {
  await standardUser.equipmentWizard.deliveryAddressTextarea.fill(deliveryAddress);
  await standardUser.equipmentWizard.nextButton.click();
});

Then('the standard user sees that the Priority and reason step opens at "Step 3 of 4"', async ({ standardUser }) => {
  await expect(standardUser.requestWizard.progressText, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
});

When('the standard user chooses the priority, enters the reason, and selects Next', async ({ standardUser }) => {
  await standardUser.equipmentWizard.highPriorityRadio.check();
  await standardUser.equipmentWizard.reasonTextarea.fill(monitorRequestReason);
  await standardUser.equipmentWizard.nextButton.click();
});

Then('the standard user sees that the Review step shows the item, quantity, delivery, address, priority and reason', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.equipmentReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(/Item\s*Monitor\s*Quantity\s*2/);
  await expect(standardUser.equipmentWizard.deliveryReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(`Ship to an address${'Address'}${deliveryAddress}`);
  await expect(standardUser.equipmentWizard.priorityAndReasonReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(/Priority\s*High/);
  await expect(standardUser.equipmentWizard.priorityAndReasonReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(monitorRequestReason);
});

When('the standard user selects Submit request', async ({ standardUser }) => {
  await standardUser.requestWizard.submitButton.click();
});

Then('the standard user sees that the wizard says "Request submitted" and shows the new request\'s number', async ({ standardUser, scenarioContext }) => {
  await expect(standardUser.equipmentWizard.submittedHeading, 'The wizard says "Request submitted" and shows the new request\'s number.').toBeVisible();
  await expect(standardUser.equipmentWizard.newRequestNumberText, 'The wizard says "Request submitted" and shows the new request\'s number.').toHaveText(/^REQ-\d{4,}$/);
  scenarioContext.requestNumber = (await standardUser.equipmentWizard.newRequestNumberText.innerText()).trim();
});

Then("the standard user sees that the wizard shows the new request's number", async ({ standardUser, scenarioContext }) => {
  await expect(standardUser.requestWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
  scenarioContext.requestNumber = (await standardUser.requestWizard.newRequestNumberText.innerText()).trim();
});

When('the standard user selects View request', async ({ standardUser }) => {
  await standardUser.requestWizard.viewRequestButton.click();
});

Then("the standard user sees that the request's page is titled with its number and {string}", async ({ standardUser, scenarioContext }, requestTitle: string) => {
  await expect(standardUser.requestPage.heading, `The request's page is titled with its number and "${requestTitle}".`).toHaveText(`${scenarioContext.requestNumber} ${requestTitle}`);
});

Then('the standard user sees that the status is {word}', async ({ standardUser }, requestStatus: string) => {
  await expect(standardUser.requestPage.statusValue, `The status is ${requestStatus}.`).toHaveText(requestStatus);
});

Then('the standard user sees that the page shows the delivery address', async ({ standardUser }) => {
  await expect(standardUser.requestPage.deliveryAddressValue, 'The page shows the delivery address.').toHaveText(deliveryAddress);
});

When('the standard user opens New request and selects Request software', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.newRequestPage.path);
  await standardUser.newRequestPage.requestSoftwareButton.click();
});

Then('the standard user sees that the Request software wizard opens at "Step 1 of 4"', async ({ standardUser }) => {
  await expect(standardUser.softwareWizard.progressText, 'The Request software wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
});

When('the standard user chooses Figma and selects Next, then chooses 1 year and 3 seats and selects Next', async ({ standardUser }) => {
  await standardUser.softwareWizard.softwareSelect.selectOption('Figma');
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.oneYearLicenseRadio.check();
  await standardUser.softwareWizard.seatsInput.fill('3');
  await standardUser.softwareWizard.nextButton.click();
});

When('the standard user selects Back', async ({ standardUser }) => {
  await standardUser.softwareWizard.backButton.click();
});

Then('the standard user sees that the License step still shows 1 year and 3 seats', async ({ standardUser }) => {
  await expect(standardUser.softwareWizard.oneYearLicenseRadio, 'The License step still shows 1 year and 3 seats.').toBeChecked();
  await expect(standardUser.softwareWizard.seatsInput, 'The License step still shows 1 year and 3 seats.').toHaveValue('3');
});

When('the standard user selects Next, enters the reason, and selects Next', async ({ standardUser }) => {
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.reasonTextarea.fill('Our team plans projects on a shared whiteboard.');
  await standardUser.softwareWizard.nextButton.click();
});

Then('the standard user sees that the Review step shows Figma, 1 year and 3 seats', async ({ standardUser }) => {
  await expect(standardUser.softwareWizard.softwareReviewRegion, 'The Review step shows Figma, 1 year and 3 seats.').toContainText(/Software\s*Figma/);
  await expect(standardUser.softwareWizard.licenseReviewRegion, 'The Review step shows Figma, 1 year and 3 seats.').toContainText(/License length\s*1 year\s*Seats\s*3/);
});

When('the standard user selects Edit for Software, chooses Miro, and selects Next until the Review step', async ({ standardUser }) => {
  await standardUser.softwareWizard.editSoftwareButton.click();
  await standardUser.softwareWizard.softwareSelect.selectOption('Miro');
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.nextButton.click();
  await standardUser.softwareWizard.nextButton.click();
});

Then('the standard user sees that the Review step shows Miro', async ({ standardUser }) => {
  await expect(standardUser.softwareWizard.softwareReviewRegion, 'The Review step shows Miro.').toContainText(/Software\s*Miro/);
});

Then('the standard user sees that the page shows 3 seats', async ({ standardUser }) => {
  await expect(standardUser.requestPage.seatsValue, 'The page shows 3 seats.').toHaveText('3');
});

When('the standard user opens New request and selects Request access', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.newRequestPage.path);
  await standardUser.newRequestPage.requestAccessButton.click();
});

Then('the standard user sees that the Request access wizard opens at "Step 1 of 3"', async ({ standardUser }) => {
  await expect(standardUser.accessWizard.progressText, 'The Request access wizard opens at "Step 1 of 3".').toHaveText('Step 1 of 3');
});

When('the standard user chooses the system and the access level', async ({ standardUser }) => {
  await standardUser.accessWizard.systemSelect.selectOption('Production database');
  await standardUser.accessWizard.administratorAccessRadio.check();
});

Then('the standard user sees that the wizard now says "Step 1 of 4"', async ({ standardUser }) => {
  await expect(standardUser.accessWizard.progressText, 'The wizard now says "Step 1 of 4".').toHaveText('Step 1 of 4');
});

Then('the standard user sees that a Security review step is added to the list of steps', async ({ standardUser }) => {
  await expect(standardUser.accessWizard.stepsList, 'A Security review step is added to the list of steps.').toContainText('Security review');
});

When('the standard user selects Next, then selects Next again without filling in the security review', async ({ standardUser }) => {
  await standardUser.accessWizard.nextButton.click();
  await standardUser.accessWizard.nextButton.click();
});

Then('the standard user sees that the reason field says "Explain in at least 20 characters why you need administrator access."', async ({ standardUser }) => {
  await expect(standardUser.accessWizard.securityReasonTextarea, 'The reason field says "Explain in at least 20 characters why you need administrator access."').toHaveAccessibleErrorMessage('Explain in at least 20 characters why you need administrator access.');
});

Then('the standard user sees that the training box says "Confirm that you\'ve completed security training."', async ({ standardUser }) => {
  await expect(standardUser.accessWizard.trainingCompletedCheckbox, 'The training box says "Confirm that you\'ve completed security training."').toHaveAccessibleErrorMessage("Confirm that you've completed security training.");
});

When('the standard user enters the security reason, checks the security training box, and selects Next', async ({ standardUser }) => {
  await standardUser.accessWizard.securityReasonTextarea.fill('I rotate the database credentials during the monthly maintenance window.');
  await standardUser.accessWizard.trainingCompletedCheckbox.check();
  await standardUser.accessWizard.nextButton.click();
});

When('the standard user enters the reason, selects Next, then selects Submit request', async ({ standardUser }) => {
  await standardUser.accessWizard.reasonTextarea.fill('Credential rotation is part of my on-call duties.');
  await standardUser.accessWizard.nextButton.click();
  await standardUser.accessWizard.submitButton.click();
});

Then('the standard user sees that the wizard says "Request submitted"', async ({ standardUser }) => {
  await expect(standardUser.accessWizard.submittedHeading, 'The wizard says "Request submitted".').toBeVisible();
});

Then('the standard user sees that the request shows access level Administrator', async ({ standardUser }) => {
  await expect(standardUser.requestPage.accessLevelValue, 'The request shows access level Administrator.').toHaveText('Administrator');
});

Then('the standard user sees that the request shows security training as Completed', async ({ standardUser }) => {
  await expect(standardUser.requestPage.securityTrainingValue, 'The request shows security training as Completed.').toHaveText('Completed');
});

When('the standard user opens New request, selects Request equipment, and chooses Laptop in Item', async ({ standardUser }) => {
  await standardUser.page.goto(standardUser.newRequestPage.path);
  await standardUser.newRequestPage.requestEquipmentButton.click();
  await standardUser.equipmentWizard.itemSelect.selectOption('Laptop');
});

Then('the standard user sees that Item shows Laptop', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.itemSelect, 'Item shows Laptop.').toHaveValue('Laptop');
});

When('the standard user selects Cancel', async ({ standardUser }) => {
  await standardUser.equipmentWizard.cancelButton.click();
});

Then('the standard user sees that the wizard asks "Discard this request?" and offers Keep editing and Discard', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.discardQuestionHeading, 'The wizard asks "Discard this request?" and offers Keep editing and Discard.').toBeVisible();
  await expect(standardUser.equipmentWizard.keepEditingButton, 'The wizard asks "Discard this request?" and offers Keep editing and Discard.').toBeVisible();
  await expect(standardUser.equipmentWizard.discardButton, 'The wizard asks "Discard this request?" and offers Keep editing and Discard.').toBeVisible();
});

When('the standard user selects Keep editing', async ({ standardUser }) => {
  await standardUser.equipmentWizard.keepEditingButton.click();
});

Then('the standard user sees that the Equipment step is back, with Laptop still chosen', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.itemSelect, 'The Equipment step is back, with Laptop still chosen.').toHaveValue('Laptop');
});

When('the standard user closes the wizard with its X, then selects Discard', async ({ standardUser }) => {
  await standardUser.equipmentWizard.closeButton.click();
  await standardUser.equipmentWizard.discardButton.click();
});

Then('the standard user sees that the wizard closes', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.dialog, 'The wizard closes.').toBeHidden();
});

When('the standard user selects Request equipment again', async ({ standardUser }) => {
  await standardUser.newRequestPage.requestEquipmentButton.click();
});

Then('the standard user sees that the wizard starts again at "Step 1 of 4" with no item chosen', async ({ standardUser }) => {
  await expect(standardUser.equipmentWizard.progressText, 'The wizard starts again at "Step 1 of 4" with no item chosen.').toHaveText('Step 1 of 4');
  await expect(standardUser.equipmentWizard.itemSelect, 'The wizard starts again at "Step 1 of 4" with no item chosen.').toHaveValue('');
});
