import { expect, plan, test } from './fixtures';

test('SP-001 Request equipment shipped to an address', { tag: '@smoke', annotation: plan('SP-001') }, async ({ standardUser }) => {
  const deliveryAddress = '500 Market Street, Seattle, WA 98101';
  const requestReason = 'Two monitors for my new desk in the Seattle office.';

  await test.step('1. Open New request and select Request equipment.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestEquipmentButton.click();
    await expect(standardUser.equipmentWizard.progressText, 'The Request equipment wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
  });

  await test.step('2. Select Next without choosing anything.', async () => {
    await standardUser.equipmentWizard.nextButton.click();
    await expect(standardUser.equipmentWizard.itemSelect, 'Item says "Choose an item."').toHaveAccessibleErrorMessage('Choose an item.');
    await expect(standardUser.equipmentWizard.progressText, 'The wizard stays at "Step 1 of 4".').toHaveText('Step 1 of 4');
  });

  await test.step('3. Choose the item and quantity, then select Next.', async () => {
    await standardUser.equipmentWizard.itemSelect.selectOption('Monitor');
    await standardUser.equipmentWizard.quantityInput.fill('2');
    await standardUser.equipmentWizard.nextButton.click();
    await expect(standardUser.equipmentWizard.progressText, 'The Delivery step opens at "Step 2 of 4".').toHaveText('Step 2 of 4');
  });

  await test.step('4. Choose Ship to an address and select Next without entering an address.', async () => {
    await standardUser.equipmentWizard.shipToAnAddressRadio.check();
    await standardUser.equipmentWizard.nextButton.click();
    await expect(standardUser.equipmentWizard.deliveryAddressTextarea, 'Delivery address says "Enter the full delivery address."').toHaveAccessibleErrorMessage('Enter the full delivery address.');
  });

  await test.step('5. Enter the address and select Next.', async () => {
    await standardUser.equipmentWizard.deliveryAddressTextarea.fill(deliveryAddress);
    await standardUser.equipmentWizard.nextButton.click();
    await expect(standardUser.equipmentWizard.progressText, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
  });

  await test.step('6. Choose the priority, enter the reason, and select Next.', async () => {
    await standardUser.equipmentWizard.highPriorityRadio.check();
    await standardUser.equipmentWizard.reasonTextarea.fill(requestReason);
    await standardUser.equipmentWizard.nextButton.click();
    await expect(standardUser.equipmentWizard.equipmentReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(/Item\s*Monitor\s*Quantity\s*2/);
    await expect(standardUser.equipmentWizard.deliveryReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(`Ship to an address${'Address'}${deliveryAddress}`);
    await expect(standardUser.equipmentWizard.priorityAndReasonReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(/Priority\s*High/);
    await expect(standardUser.equipmentWizard.priorityAndReasonReviewRegion, 'The Review step shows the item, quantity, delivery, address, priority and reason.').toContainText(requestReason);
  });

  const requestNumber = await test.step('7. Select Submit request.', async () => {
    await standardUser.equipmentWizard.submitButton.click();
    await expect(standardUser.equipmentWizard.submittedHeading, 'The wizard says "Request submitted" and shows the new request\'s number.').toBeVisible();
    await expect(standardUser.equipmentWizard.newRequestNumberText, 'The wizard says "Request submitted" and shows the new request\'s number.').toHaveText(/^REQ-\d{4,}$/);
    return (await standardUser.equipmentWizard.newRequestNumberText.innerText()).trim();
  });

  await test.step('8. Select View request.', async () => {
    await standardUser.equipmentWizard.viewRequestButton.click();
    await expect(standardUser.requestPage.heading, 'The request\'s page is titled with its number and "Monitor × 2".').toHaveText(`${requestNumber} Monitor × 2`);
    await expect(standardUser.requestPage.statusValue, 'The status is Submitted.').toHaveText('Submitted');
    await expect(standardUser.requestPage.deliveryAddressValue, 'The page shows the delivery address.').toHaveText(deliveryAddress);
  });
});

test('SP-002 Change answers with Back and Edit', { tag: '@regression', annotation: plan('SP-002') }, async ({ standardUser }) => {
  await test.step('1. Open New request and select Request software.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestSoftwareButton.click();
    await expect(standardUser.softwareWizard.progressText, 'The Request software wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
  });

  await test.step('2. Choose Figma and select Next, then choose 1 year and 3 seats and select Next.', async () => {
    await standardUser.softwareWizard.softwareSelect.selectOption('Figma');
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.oneYearLicenseRadio.check();
    await standardUser.softwareWizard.seatsInput.fill('3');
    await standardUser.softwareWizard.nextButton.click();
    await expect(standardUser.softwareWizard.progressText, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
  });

  await test.step('3. Select Back.', async () => {
    await standardUser.softwareWizard.backButton.click();
    await expect(standardUser.softwareWizard.oneYearLicenseRadio, 'The License step still shows 1 year and 3 seats.').toBeChecked();
    await expect(standardUser.softwareWizard.seatsInput, 'The License step still shows 1 year and 3 seats.').toHaveValue('3');
  });

  await test.step('4. Select Next, enter the reason, and select Next.', async () => {
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.reasonTextarea.fill('Our team plans projects on a shared whiteboard.');
    await standardUser.softwareWizard.nextButton.click();
    await expect(standardUser.softwareWizard.softwareReviewRegion, 'The Review step shows Figma, 1 year and 3 seats.').toContainText(/Software\s*Figma/);
    await expect(standardUser.softwareWizard.licenseReviewRegion, 'The Review step shows Figma, 1 year and 3 seats.').toContainText(/License length\s*1 year\s*Seats\s*3/);
  });

  await test.step('5. Select Edit for Software, choose Miro, and select Next until the Review step.', async () => {
    await standardUser.softwareWizard.editSoftwareButton.click();
    await standardUser.softwareWizard.softwareSelect.selectOption('Miro');
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.nextButton.click();
    await standardUser.softwareWizard.nextButton.click();
    await expect(standardUser.softwareWizard.softwareReviewRegion, 'The Review step shows Miro.').toContainText(/Software\s*Miro/);
  });

  await test.step('6. Select Submit request, then select View request.', async () => {
    await standardUser.softwareWizard.submitButton.click();
    await expect(standardUser.softwareWizard.newRequestNumberText, "The wizard shows the new request's number.").toHaveText(/^REQ-\d{4,}$/);
    const requestNumber = (await standardUser.softwareWizard.newRequestNumberText.innerText()).trim();
    await standardUser.softwareWizard.viewRequestButton.click();
    await expect(standardUser.requestPage.heading, 'The request\'s page is titled with its number and "Miro (1 year)".').toHaveText(`${requestNumber} Miro (1 year)`);
    await expect(standardUser.requestPage.seatsValue, 'The page shows 3 seats.').toHaveText('3');
  });
});

test('SP-003 Administrator access adds a security review', { tag: '@regression', annotation: plan('SP-003') }, async ({ standardUser }) => {
  await test.step('1. Open New request and select Request access.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestAccessButton.click();
    await expect(standardUser.accessWizard.progressText, 'The Request access wizard opens at "Step 1 of 3".').toHaveText('Step 1 of 3');
  });

  await test.step('2. Choose the system and the access level.', async () => {
    await standardUser.accessWizard.systemSelect.selectOption('Production database');
    await standardUser.accessWizard.administratorAccessRadio.check();
    await expect(standardUser.accessWizard.progressText, 'The wizard now says "Step 1 of 4".').toHaveText('Step 1 of 4');
    await expect(standardUser.accessWizard.stepsList, 'A Security review step is added to the list of steps.').toContainText('Security review');
  });

  await test.step('3. Select Next, then select Next again without filling in the security review.', async () => {
    await standardUser.accessWizard.nextButton.click();
    await standardUser.accessWizard.nextButton.click();
    await expect(standardUser.accessWizard.securityReasonTextarea, 'The reason field says "Explain in at least 20 characters why you need administrator access."').toHaveAccessibleErrorMessage('Explain in at least 20 characters why you need administrator access.');
    await expect(standardUser.accessWizard.trainingCompletedCheckbox, 'The training box says "Confirm that you\'ve completed security training."').toHaveAccessibleErrorMessage("Confirm that you've completed security training.");
  });

  await test.step('4. Enter the security reason, check the security training box, and select Next.', async () => {
    await standardUser.accessWizard.securityReasonTextarea.fill('I rotate the database credentials during the monthly maintenance window.');
    await standardUser.accessWizard.trainingCompletedCheckbox.check();
    await standardUser.accessWizard.nextButton.click();
    await expect(standardUser.accessWizard.progressText, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
  });

  await test.step('5. Enter the reason, select Next, then select Submit request.', async () => {
    await standardUser.accessWizard.reasonTextarea.fill('Credential rotation is part of my on-call duties.');
    await standardUser.accessWizard.nextButton.click();
    await standardUser.accessWizard.submitButton.click();
    await expect(standardUser.accessWizard.submittedHeading, 'The wizard says "Request submitted".').toBeVisible();
  });

  await test.step('6. Select View request.', async () => {
    await standardUser.accessWizard.viewRequestButton.click();
    await expect(standardUser.requestPage.accessLevelValue, 'The request shows access level Administrator.').toHaveText('Administrator');
    await expect(standardUser.requestPage.securityTrainingValue, 'The request shows security training as Completed.').toHaveText('Completed');
  });
});

test('SP-004 Discard an unfinished request', { tag: '@regression', annotation: plan('SP-004') }, async ({ standardUser }) => {
  await test.step('1. Open New request, select Request equipment, and choose Laptop in Item.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestEquipmentButton.click();
    await standardUser.equipmentWizard.itemSelect.selectOption('Laptop');
    await expect(standardUser.equipmentWizard.itemSelect, 'Item shows Laptop.').toHaveValue('Laptop');
  });

  await test.step('2. Select Cancel.', async () => {
    await standardUser.equipmentWizard.cancelButton.click();
    await expect(standardUser.equipmentWizard.discardQuestionHeading, 'The wizard asks "Discard this request?" and offers Keep editing and Discard.').toBeVisible();
    await expect(standardUser.equipmentWizard.keepEditingButton, 'The wizard asks "Discard this request?" and offers Keep editing and Discard.').toBeVisible();
    await expect(standardUser.equipmentWizard.discardButton, 'The wizard asks "Discard this request?" and offers Keep editing and Discard.').toBeVisible();
  });

  await test.step('3. Select Keep editing.', async () => {
    await standardUser.equipmentWizard.keepEditingButton.click();
    await expect(standardUser.equipmentWizard.itemSelect, 'The Equipment step is back, with Laptop still chosen.').toHaveValue('Laptop');
  });

  await test.step('4. Close the wizard with its X, then select Discard.', async () => {
    await standardUser.equipmentWizard.closeButton.click();
    await standardUser.equipmentWizard.discardButton.click();
    await expect(standardUser.equipmentWizard.dialog, 'The wizard closes.').toBeHidden();
  });

  await test.step('5. Select Request equipment again.', async () => {
    await standardUser.newRequestPage.requestEquipmentButton.click();
    await expect(standardUser.equipmentWizard.progressText, 'The wizard starts again at "Step 1 of 4" with no item chosen.').toHaveText('Step 1 of 4');
    await expect(standardUser.equipmentWizard.itemSelect, 'The wizard starts again at "Step 1 of 4" with no item chosen.').toHaveValue('');
  });
});
