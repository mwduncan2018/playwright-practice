import { expect, plan, test } from './fixtures';

test(
  'SP-001 Request equipment shipped to an address',
  { tag: '@smoke', annotation: plan('SP-001') },
  async ({ standard }) => {
    const address = '500 Market Street, Seattle, WA 98101';
    const reason = 'Two monitors for my new desk in the Seattle office.';

    await test.step('1. Open New request and select Request equipment.', async () => {
      await standard.page.goto(standard.newRequest.path);
      await standard.newRequest.requestEquipment.click();
      await expect(
        standard.equipmentWizard.progress,
        'The Request equipment wizard opens at "Step 1 of 4".',
      ).toHaveText('Step 1 of 4');
    });

    await test.step('2. Select Next without choosing anything.', async () => {
      await standard.equipmentWizard.nextButton.click();
      await expect(standard.equipmentWizard.item, 'Item says "Choose an item."').toHaveAccessibleErrorMessage(
        'Choose an item.',
      );
      await expect(standard.equipmentWizard.progress, 'The wizard stays at "Step 1 of 4".').toHaveText('Step 1 of 4');
    });

    await test.step('3. Choose the item and quantity, then select Next.', async () => {
      await standard.equipmentWizard.item.selectOption('Monitor');
      await standard.equipmentWizard.quantity.fill('2');
      await standard.equipmentWizard.nextButton.click();
      await expect(standard.equipmentWizard.progress, 'The Delivery step opens at "Step 2 of 4".').toHaveText(
        'Step 2 of 4',
      );
    });

    await test.step('4. Choose Ship to an address and select Next without entering an address.', async () => {
      await standard.equipmentWizard.dialog.getByRole('radio', { name: 'Ship to an address', exact: true }).check();
      await standard.equipmentWizard.nextButton.click();
      await expect(
        standard.equipmentWizard.address,
        'Delivery address says "Enter the full delivery address."',
      ).toHaveAccessibleErrorMessage('Enter the full delivery address.');
    });

    await test.step('5. Enter the address and select Next.', async () => {
      await standard.equipmentWizard.address.fill(address);
      await standard.equipmentWizard.nextButton.click();
      await expect(
        standard.equipmentWizard.progress,
        'The Priority and reason step opens at "Step 3 of 4".',
      ).toHaveText('Step 3 of 4');
    });

    await test.step('6. Choose the priority, enter the reason, and select Next.', async () => {
      await standard.equipmentWizard.dialog.getByRole('radio', { name: 'High', exact: true }).check();
      await standard.equipmentWizard.reason.fill(reason);
      await standard.equipmentWizard.nextButton.click();
      const review = 'The Review step shows the item, quantity, delivery, address, priority and reason.';
      await expect(standard.equipmentWizard.dialog.getByRole('region', { name: 'Equipment' }), review).toContainText(
        /Item\s*Monitor\s*Quantity\s*2/,
      );
      await expect(standard.equipmentWizard.dialog.getByRole('region', { name: 'Delivery' }), review).toContainText(
        `Ship to an address${'Address'}${address}`,
      );
      await expect(
        standard.equipmentWizard.dialog.getByRole('region', { name: 'Priority and reason' }),
        review,
      ).toContainText(/Priority\s*High/);
      await expect(
        standard.equipmentWizard.dialog.getByRole('region', { name: 'Priority and reason' }),
        review,
      ).toContainText(reason);
    });

    const requestNumber = await test.step('7. Select Submit request.', async () => {
      await standard.equipmentWizard.submitButton.click();
      const submitted = 'The wizard says "Request submitted" and shows the new request\'s number.';
      await expect(standard.equipmentWizard.submittedHeading, submitted).toBeVisible();
      await expect(standard.equipmentWizard.newRequestNumber, submitted).toHaveText(/^REQ-\d{4,}$/);
      return (await standard.equipmentWizard.newRequestNumber.innerText()).trim();
    });

    await test.step('8. Select View request.', async () => {
      await standard.equipmentWizard.viewRequestButton.click();
      await expect(
        standard.request.heading,
        'The request\'s page is titled with its number and "Monitor × 2".',
      ).toHaveText(`${requestNumber} Monitor × 2`);
      await expect(standard.request.status, 'The status is Submitted.').toHaveText('Submitted');
      await expect(standard.request.address, 'The page shows the delivery address.').toHaveText(address);
    });
  },
);

test(
  'SP-002 Change answers with Back and Edit',
  { tag: '@regression', annotation: plan('SP-002') },
  async ({ standard }) => {
    await test.step('1. Open New request and select Request software.', async () => {
      await standard.page.goto(standard.newRequest.path);
      await standard.newRequest.requestSoftware.click();
      await expect(standard.softwareWizard.progress, 'The Request software wizard opens at "Step 1 of 4".').toHaveText(
        'Step 1 of 4',
      );
    });

    await test.step('2. Choose Figma and select Next, then choose 1 year and 3 seats and select Next.', async () => {
      await standard.softwareWizard.software.selectOption('Figma');
      await standard.softwareWizard.nextButton.click();
      await standard.softwareWizard.dialog.getByRole('radio', { name: '1 year', exact: true }).check();
      await standard.softwareWizard.seats.fill('3');
      await standard.softwareWizard.nextButton.click();
      await expect(standard.softwareWizard.progress, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText(
        'Step 3 of 4',
      );
    });

    await test.step('3. Select Back.', async () => {
      await standard.softwareWizard.backButton.click();
      const kept = 'The License step still shows 1 year and 3 seats.';
      await expect(
        standard.softwareWizard.dialog.getByRole('radio', { name: '1 year', exact: true }),
        kept,
      ).toBeChecked();
      await expect(standard.softwareWizard.seats, kept).toHaveValue('3');
    });

    await test.step('4. Select Next, enter the reason, and select Next.', async () => {
      await standard.softwareWizard.nextButton.click();
      await standard.softwareWizard.reason.fill('Our team plans projects on a shared whiteboard.');
      await standard.softwareWizard.nextButton.click();
      const review = 'The Review step shows Figma, 1 year and 3 seats.';
      await expect(standard.softwareWizard.dialog.getByRole('region', { name: 'Software' }), review).toContainText(
        /Software\s*Figma/,
      );
      await expect(standard.softwareWizard.dialog.getByRole('region', { name: 'License' }), review).toContainText(
        /License length\s*1 year\s*Seats\s*3/,
      );
    });

    await test.step('5. Select Edit for Software, choose Miro, and select Next until the Review step.', async () => {
      await standard.softwareWizard.dialog.getByRole('button', { name: 'Edit Software' }).click();
      await standard.softwareWizard.software.selectOption('Miro');
      await standard.softwareWizard.nextButton.click();
      await standard.softwareWizard.nextButton.click();
      await standard.softwareWizard.nextButton.click();
      await expect(
        standard.softwareWizard.dialog.getByRole('region', { name: 'Software' }),
        'The Review step shows Miro.',
      ).toContainText(/Software\s*Miro/);
    });

    await test.step('6. Select Submit request, then select View request.', async () => {
      await standard.softwareWizard.submitButton.click();
      const requestNumber = (await standard.softwareWizard.newRequestNumber.innerText()).trim();
      await standard.softwareWizard.viewRequestButton.click();
      await expect(
        standard.request.heading,
        'The request\'s page is titled with its number and "Miro (1 year)".',
      ).toHaveText(`${requestNumber} Miro (1 year)`);
      await expect(standard.request.seats, 'The page shows 3 seats.').toHaveText('3');
    });
  },
);

test(
  'SP-003 Administrator access adds a security review',
  { tag: '@regression', annotation: plan('SP-003') },
  async ({ standard }) => {
    await test.step('1. Open New request and select Request access.', async () => {
      await standard.page.goto(standard.newRequest.path);
      await standard.newRequest.requestAccess.click();
      await expect(standard.accessWizard.progress, 'The Request access wizard opens at "Step 1 of 3".').toHaveText(
        'Step 1 of 3',
      );
    });

    await test.step('2. Choose the system and the access level.', async () => {
      await standard.accessWizard.system.selectOption('Production database');
      await standard.accessWizard.dialog.getByRole('radio', { name: 'Administrator', exact: true }).check();
      await expect(standard.accessWizard.progress, 'The wizard now says "Step 1 of 4".').toHaveText('Step 1 of 4');
      await expect(standard.accessWizard.steps, 'A Security review step is added to the list of steps.').toContainText(
        'Security review',
      );
    });

    await test.step('3. Select Next, then select Next again without filling in the security review.', async () => {
      await standard.accessWizard.nextButton.click();
      await standard.accessWizard.nextButton.click();
      await expect(
        standard.accessWizard.securityReason,
        'The reason field says "Explain in at least 20 characters why you need administrator access."',
      ).toHaveAccessibleErrorMessage('Explain in at least 20 characters why you need administrator access.');
      await expect(
        standard.accessWizard.trainingCompleted,
        'The training box says "Confirm that you\'ve completed security training."',
      ).toHaveAccessibleErrorMessage("Confirm that you've completed security training.");
    });

    await test.step('4. Enter the security reason, check the security training box, and select Next.', async () => {
      await standard.accessWizard.securityReason.fill(
        'I rotate the database credentials during the monthly maintenance window.',
      );
      await standard.accessWizard.trainingCompleted.check();
      await standard.accessWizard.nextButton.click();
      await expect(standard.accessWizard.progress, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText(
        'Step 3 of 4',
      );
    });

    await test.step('5. Enter the reason, select Next, then select Submit request.', async () => {
      await standard.accessWizard.reason.fill('Credential rotation is part of my on-call duties.');
      await standard.accessWizard.nextButton.click();
      await standard.accessWizard.submitButton.click();
      await expect(standard.accessWizard.submittedHeading, 'The wizard says "Request submitted".').toBeVisible();
    });

    await test.step('6. Select View request.', async () => {
      await standard.accessWizard.viewRequestButton.click();
      await expect(standard.request.accessLevel, 'The request shows access level Administrator.').toHaveText(
        'Administrator',
      );
      await expect(standard.request.securityTraining, 'The request shows security training as Completed.').toHaveText(
        'Completed',
      );
    });
  },
);

test(
  'SP-004 Discard an unfinished request',
  { tag: '@regression', annotation: plan('SP-004') },
  async ({ standard }) => {
    await test.step('1. Open New request, select Request equipment, and choose Laptop in Item.', async () => {
      await standard.page.goto(standard.newRequest.path);
      await standard.newRequest.requestEquipment.click();
      await standard.equipmentWizard.item.selectOption('Laptop');
      await expect(standard.equipmentWizard.item, 'Item shows Laptop.').toHaveValue('Laptop');
    });

    await test.step('2. Select Cancel.', async () => {
      await standard.equipmentWizard.cancelButton.click();
      const asks = 'The wizard asks "Discard this request?" and offers Keep editing and Discard.';
      await expect(standard.equipmentWizard.discardQuestion, asks).toBeVisible();
      await expect(standard.equipmentWizard.keepEditingButton, asks).toBeVisible();
      await expect(standard.equipmentWizard.discardButton, asks).toBeVisible();
    });

    await test.step('3. Select Keep editing.', async () => {
      await standard.equipmentWizard.keepEditingButton.click();
      await expect(standard.equipmentWizard.item, 'The Equipment step is back, with Laptop still chosen.').toHaveValue(
        'Laptop',
      );
    });

    await test.step('4. Close the wizard with its X, then select Discard.', async () => {
      await standard.equipmentWizard.closeButton.click();
      await standard.equipmentWizard.discardButton.click();
      await expect(standard.equipmentWizard.dialog, 'The wizard closes.').toBeHidden();
    });

    await test.step('5. Select Request equipment again.', async () => {
      await standard.newRequest.requestEquipment.click();
      const fresh = 'The wizard starts again at "Step 1 of 4" with no item chosen.';
      await expect(standard.equipmentWizard.progress, fresh).toHaveText('Step 1 of 4');
      await expect(standard.equipmentWizard.item, fresh).toHaveValue('');
    });
  },
);
