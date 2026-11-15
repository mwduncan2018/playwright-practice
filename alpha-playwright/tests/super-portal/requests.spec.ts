import { expect, plan, test } from './fixtures';

test('SP-005 Comment on and cancel your request', { tag: '@regression', annotation: plan('SP-005') }, async ({ standard }) => {
  const comment = 'Any full-size keyboard is fine.';

  const requestNumber =
    await test.step('1. Submit the request in the test data, then select View request.', async () => {
      await standard.page.goto(standard.newRequest.path);
      await standard.newRequest.requestEquipment.click();
      await standard.equipmentWizard.item.selectOption('Keyboard');
      await standard.equipmentWizard.quantity.fill('1');
      await standard.equipmentWizard.nextButton.click();
      await standard.equipmentWizard.dialog.getByRole('radio', { name: 'Deliver to my desk', exact: true }).check();
      await standard.equipmentWizard.nextButton.click();
      await standard.equipmentWizard.reason.fill('The keys on my keyboard stick.');
      await standard.equipmentWizard.nextButton.click();
      await standard.equipmentWizard.submitButton.click();
      const number = (await standard.equipmentWizard.newRequestNumber.innerText()).trim();
      await standard.equipmentWizard.viewRequestButton.click();
      const shows = "The request's page shows the status Submitted and a Cancel request button.";
      await expect(standard.request.status, shows).toHaveText('Submitted');
      await expect(standard.request.cancelRequestButton, shows).toBeVisible();
      return number;
    });

  await test.step('2. Enter the comment and select Post comment.', async () => {
    await standard.request.commentField.fill(comment);
    await standard.request.postCommentButton.click();
    await expect(
      standard.alerts.messages.filter({ hasText: 'Comment posted.' }),
      'The message "Comment posted." appears.',
    ).toBeVisible();
    await expect(standard.request.history, 'The history lists the comment.').toContainText(comment);
  });

  await test.step('3. Select Cancel request, then select Keep request.', async () => {
    await standard.request.cancelRequestButton.click();
    await standard.cancelRequestDialog.dismissButton.click();
    const unchanged = 'The dialog closes and the status is still Submitted.';
    await expect(standard.cancelRequestDialog.dialog, unchanged).toBeHidden();
    await expect(standard.request.status, unchanged).toHaveText('Submitted');
  });

  await test.step('4. Select Cancel request, then select Cancel request in the dialog.', async () => {
    await standard.request.cancelRequestButton.click();
    await standard.cancelRequestDialog.confirmButton.click();
    await expect(
      standard.alerts.messages.filter({ hasText: `Cancelled ${requestNumber}.` }),
      'The message "Cancelled <number>." appears.',
    ).toBeVisible();
    const cancelled = 'The status is Cancelled, and the page says the user cancelled it.';
    await expect(standard.request.status, cancelled).toHaveText('Cancelled');
    await expect(standard.request.decision, cancelled).toContainText(`Cancelled by ${standard.account.name}`);
    await expect(standard.request.cancelRequestButton, "There's no Cancel request button.").toHaveCount(0);
  });
});
