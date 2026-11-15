import { expect, plan, test } from './fixtures';

test('SP-005 Comment on and cancel your request', { tag: '@regression', annotation: plan('SP-005') }, async ({ standardUser }) => {
  const commentText = 'Any full-size keyboard is fine.';

  const requestNumber =
    await test.step('1. Submit the request in the test data, then select View request.', async () => {
      await standardUser.page.goto(standardUser.newRequestPage.path);
      await standardUser.newRequestPage.requestEquipment.click();
      await standardUser.equipmentWizard.item.selectOption('Keyboard');
      await standardUser.equipmentWizard.quantity.fill('1');
      await standardUser.equipmentWizard.nextButton.click();
      await standardUser.equipmentWizard.dialog.getByRole('radio', { name: 'Deliver to my desk', exact: true }).check();
      await standardUser.equipmentWizard.nextButton.click();
      await standardUser.equipmentWizard.reason.fill('The keys on my keyboard stick.');
      await standardUser.equipmentWizard.nextButton.click();
      await standardUser.equipmentWizard.submitButton.click();
      const newRequestNumber = (await standardUser.equipmentWizard.newRequestNumber.innerText()).trim();
      await standardUser.equipmentWizard.viewRequestButton.click();
      const expectedResult = "The request's page shows the status Submitted and a Cancel request button.";
      await expect(standardUser.requestPage.status, expectedResult).toHaveText('Submitted');
      await expect(standardUser.requestPage.cancelRequestButton, expectedResult).toBeVisible();
      return newRequestNumber;
    });

  await test.step('2. Enter the comment and select Post comment.', async () => {
    await standardUser.requestPage.commentField.fill(commentText);
    await standardUser.requestPage.postCommentButton.click();
    await expect(
      standardUser.alertsPage.messages.filter({ hasText: 'Comment posted.' }),
      'The message "Comment posted." appears.',
    ).toBeVisible();
    await expect(standardUser.requestPage.history, 'The history lists the comment.').toContainText(commentText);
  });

  await test.step('3. Select Cancel request, then select Keep request.', async () => {
    await standardUser.requestPage.cancelRequestButton.click();
    await standardUser.cancelRequestDialog.dismissButton.click();
    const expectedResult = 'The dialog closes and the status is still Submitted.';
    await expect(standardUser.cancelRequestDialog.dialog, expectedResult).toBeHidden();
    await expect(standardUser.requestPage.status, expectedResult).toHaveText('Submitted');
  });

  await test.step('4. Select Cancel request, then select Cancel request in the dialog.', async () => {
    await standardUser.requestPage.cancelRequestButton.click();
    await standardUser.cancelRequestDialog.confirmButton.click();
    await expect(
      standardUser.alertsPage.messages.filter({ hasText: `Cancelled ${requestNumber}.` }),
      'The message "Cancelled <number>." appears.',
    ).toBeVisible();
    const expectedResult = 'The status is Cancelled, and the page says the user cancelled it.';
    await expect(standardUser.requestPage.status, expectedResult).toHaveText('Cancelled');
    await expect(standardUser.requestPage.decision, expectedResult).toContainText(`Cancelled by ${standardUser.account.name}`);
    await expect(standardUser.requestPage.cancelRequestButton, "There's no Cancel request button.").toHaveCount(0);
  });
});
