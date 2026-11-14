import { expect, plan, test } from './fixtures';

test(
  'SP-001 Request equipment shipped to an address',
  { tag: '@smoke', annotation: plan('SP-001') },
  async ({ page, portal }) => {
    const wizard = portal.equipmentWizard;
    const address = '500 Market Street, Seattle, WA 98101';
    const reason = 'Two monitors for my new desk in the Seattle office.';

    await test.step('1. Open New request and select Request equipment.', async () => {
      await page.goto(portal.newRequest.path);
      await portal.newRequest.requestEquipment.click();
      await expect(wizard.progress, 'The Request equipment wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
    });

    await test.step('2. Select Next without choosing anything.', async () => {
      await wizard.nextButton.click();
      await expect(wizard.item, 'Item says "Choose an item."').toHaveAccessibleErrorMessage('Choose an item.');
      await expect(wizard.progress, 'The wizard stays at "Step 1 of 4".').toHaveText('Step 1 of 4');
    });

    await test.step('3. Choose the item and quantity, then select Next.', async () => {
      await wizard.item.selectOption('Monitor');
      await wizard.quantity.fill('2');
      await wizard.nextButton.click();
      await expect(wizard.progress, 'The Delivery step opens at "Step 2 of 4".').toHaveText('Step 2 of 4');
    });

    await test.step('4. Choose Ship to an address and select Next without entering an address.', async () => {
      await wizard.dialog.getByRole('radio', { name: 'Ship to an address', exact: true }).check();
      await wizard.nextButton.click();
      await expect(
        wizard.address,
        'Delivery address says "Enter the full delivery address."',
      ).toHaveAccessibleErrorMessage('Enter the full delivery address.');
    });

    await test.step('5. Enter the address and select Next.', async () => {
      await wizard.address.fill(address);
      await wizard.nextButton.click();
      await expect(wizard.progress, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
    });

    await test.step('6. Choose the priority, enter the reason, and select Next.', async () => {
      await wizard.dialog.getByRole('radio', { name: 'High', exact: true }).check();
      await wizard.reason.fill(reason);
      await wizard.nextButton.click();
      const review = 'The Review step shows the item, quantity, delivery, address, priority and reason.';
      await expect(wizard.dialog.getByRole('region', { name: 'Equipment' }), review).toContainText(
        /Item\s*Monitor\s*Quantity\s*2/,
      );
      await expect(wizard.dialog.getByRole('region', { name: 'Delivery' }), review).toContainText(
        `Ship to an address${'Address'}${address}`,
      );
      await expect(wizard.dialog.getByRole('region', { name: 'Priority and reason' }), review).toContainText(
        /Priority\s*High/,
      );
      await expect(wizard.dialog.getByRole('region', { name: 'Priority and reason' }), review).toContainText(reason);
    });

    const requestNumber = await test.step('7. Select Submit request.', async () => {
      await wizard.submitButton.click();
      const submitted = 'The wizard says "Request submitted" and shows the new request\'s number.';
      await expect(wizard.submittedHeading, submitted).toBeVisible();
      await expect(wizard.newRequestNumber, submitted).toHaveText(/^REQ-\d{4,}$/);
      return (await wizard.newRequestNumber.innerText()).trim();
    });

    await test.step('8. Select View request.', async () => {
      await wizard.viewRequestButton.click();
      await expect(
        portal.request.heading,
        'The request\'s page is titled with its number and "Monitor × 2".',
      ).toHaveText(`${requestNumber} Monitor × 2`);
      await expect(portal.request.status, 'The status is Submitted.').toHaveText('Submitted');
      await expect(portal.request.address, 'The page shows the delivery address.').toHaveText(address);
    });
  },
);

test(
  'SP-002 Change answers with Back and Edit',
  { tag: '@regression', annotation: plan('SP-002') },
  async ({ page, portal }) => {
    const wizard = portal.softwareWizard;

    await test.step('1. Open New request and select Request software.', async () => {
      await page.goto(portal.newRequest.path);
      await portal.newRequest.requestSoftware.click();
      await expect(wizard.progress, 'The Request software wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
    });

    await test.step('2. Choose Figma and select Next, then choose 1 year and 3 seats and select Next.', async () => {
      await wizard.software.selectOption('Figma');
      await wizard.nextButton.click();
      await wizard.dialog.getByRole('radio', { name: '1 year', exact: true }).check();
      await wizard.seats.fill('3');
      await wizard.nextButton.click();
      await expect(wizard.progress, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
    });

    await test.step('3. Select Back.', async () => {
      await wizard.backButton.click();
      const kept = 'The License step still shows 1 year and 3 seats.';
      await expect(wizard.dialog.getByRole('radio', { name: '1 year', exact: true }), kept).toBeChecked();
      await expect(wizard.seats, kept).toHaveValue('3');
    });

    await test.step('4. Select Next, enter the reason, and select Next.', async () => {
      await wizard.nextButton.click();
      await wizard.reason.fill('Our team plans projects on a shared whiteboard.');
      await wizard.nextButton.click();
      const review = 'The Review step shows Figma, 1 year and 3 seats.';
      await expect(wizard.dialog.getByRole('region', { name: 'Software' }), review).toContainText(/Software\s*Figma/);
      await expect(wizard.dialog.getByRole('region', { name: 'License' }), review).toContainText(
        /License length\s*1 year\s*Seats\s*3/,
      );
    });

    await test.step('5. Select Edit for Software, choose Miro, and select Next until the Review step.', async () => {
      await wizard.dialog.getByRole('button', { name: 'Edit Software' }).click();
      await wizard.software.selectOption('Miro');
      await wizard.nextButton.click();
      await wizard.nextButton.click();
      await wizard.nextButton.click();
      await expect(
        wizard.dialog.getByRole('region', { name: 'Software' }),
        'The Review step shows Miro.',
      ).toContainText(/Software\s*Miro/);
    });

    await test.step('6. Select Submit request, then select View request.', async () => {
      await wizard.submitButton.click();
      const requestNumber = (await wizard.newRequestNumber.innerText()).trim();
      await wizard.viewRequestButton.click();
      await expect(
        portal.request.heading,
        'The request\'s page is titled with its number and "Miro (1 year)".',
      ).toHaveText(`${requestNumber} Miro (1 year)`);
      await expect(portal.request.seats, 'The page shows 3 seats.').toHaveText('3');
    });
  },
);

test(
  'SP-003 Administrator access adds a security review',
  { tag: '@regression', annotation: plan('SP-003') },
  async ({ page, portal }) => {
    const wizard = portal.accessWizard;

    await test.step('1. Open New request and select Request access.', async () => {
      await page.goto(portal.newRequest.path);
      await portal.newRequest.requestAccess.click();
      await expect(wizard.progress, 'The Request access wizard opens at "Step 1 of 3".').toHaveText('Step 1 of 3');
    });

    await test.step('2. Choose the system and the access level.', async () => {
      await wizard.system.selectOption('Production database');
      await wizard.dialog.getByRole('radio', { name: 'Administrator', exact: true }).check();
      await expect(wizard.progress, 'The wizard now says "Step 1 of 4".').toHaveText('Step 1 of 4');
      await expect(wizard.steps, 'A Security review step is added to the list of steps.').toContainText(
        'Security review',
      );
    });

    await test.step('3. Select Next, then select Next again without filling in the security review.', async () => {
      await wizard.nextButton.click();
      await wizard.nextButton.click();
      await expect(
        wizard.securityReason,
        'The reason field says "Explain in at least 20 characters why you need administrator access."',
      ).toHaveAccessibleErrorMessage('Explain in at least 20 characters why you need administrator access.');
      await expect(
        wizard.trainingCompleted,
        'The training box says "Confirm that you\'ve completed security training."',
      ).toHaveAccessibleErrorMessage("Confirm that you've completed security training.");
    });

    await test.step('4. Enter the security reason, check the security training box, and select Next.', async () => {
      await wizard.securityReason.fill('I rotate the database credentials during the monthly maintenance window.');
      await wizard.trainingCompleted.check();
      await wizard.nextButton.click();
      await expect(wizard.progress, 'The Priority and reason step opens at "Step 3 of 4".').toHaveText('Step 3 of 4');
    });

    await test.step('5. Enter the reason, select Next, then select Submit request.', async () => {
      await wizard.reason.fill('Credential rotation is part of my on-call duties.');
      await wizard.nextButton.click();
      await wizard.submitButton.click();
      await expect(wizard.submittedHeading, 'The wizard says "Request submitted".').toBeVisible();
    });

    await test.step('6. Select View request.', async () => {
      await wizard.viewRequestButton.click();
      await expect(portal.request.accessLevel, 'The request shows access level Administrator.').toHaveText(
        'Administrator',
      );
      await expect(portal.request.securityTraining, 'The request shows security training as Completed.').toHaveText(
        'Completed',
      );
    });
  },
);

test(
  'SP-004 Discard an unfinished request',
  { tag: '@regression', annotation: plan('SP-004') },
  async ({ page, portal }) => {
    const wizard = portal.equipmentWizard;

    await test.step('1. Open New request, select Request equipment, and choose Laptop in Item.', async () => {
      await page.goto(portal.newRequest.path);
      await portal.newRequest.requestEquipment.click();
      await wizard.item.selectOption('Laptop');
      await expect(wizard.item, 'Item shows Laptop.').toHaveValue('Laptop');
    });

    await test.step('2. Select Cancel.', async () => {
      await wizard.cancelButton.click();
      const asks = 'The wizard asks "Discard this request?" and offers Keep editing and Discard.';
      await expect(wizard.discardQuestion, asks).toBeVisible();
      await expect(wizard.keepEditingButton, asks).toBeVisible();
      await expect(wizard.discardButton, asks).toBeVisible();
    });

    await test.step('3. Select Keep editing.', async () => {
      await wizard.keepEditingButton.click();
      await expect(wizard.item, 'The Equipment step is back, with Laptop still chosen.').toHaveValue('Laptop');
    });

    await test.step('4. Close the wizard with its X, then select Discard.', async () => {
      await wizard.closeButton.click();
      await wizard.discardButton.click();
      await expect(wizard.dialog, 'The wizard closes.').toBeHidden();
    });

    await test.step('5. Select Request equipment again.', async () => {
      await portal.newRequest.requestEquipment.click();
      const fresh = 'The wizard starts again at "Step 1 of 4" with no item chosen.';
      await expect(wizard.progress, fresh).toHaveText('Step 1 of 4');
      await expect(wizard.item, fresh).toHaveValue('');
    });
  },
);
