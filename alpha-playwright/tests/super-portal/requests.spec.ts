import { expect, plan, test } from './fixtures';

test('SP-005 Comment on and cancel your request', { tag: '@regression', annotation: plan('SP-005') }, async ({ standardUser }) => {
  const commentText = 'Any full-size keyboard is fine.';

  const requestNumber = await test.step('1. Submit the request in the test data, then select View request.', async () => {
    await standardUser.page.goto(standardUser.newRequestPage.path);
    await standardUser.newRequestPage.requestEquipmentButton.click();
    await standardUser.equipmentWizard.itemSelect.selectOption('Keyboard');
    await standardUser.equipmentWizard.quantityInput.fill('1');
    await standardUser.equipmentWizard.nextButton.click();
    await standardUser.equipmentWizard.deliverToMyDeskRadio.check();
    await standardUser.equipmentWizard.nextButton.click();
    await standardUser.equipmentWizard.reasonTextarea.fill('The keys on my keyboard stick.');
    await standardUser.equipmentWizard.nextButton.click();
    await standardUser.equipmentWizard.submitButton.click();
    const newRequestNumber = (await standardUser.equipmentWizard.newRequestNumberText.innerText()).trim();
    await standardUser.equipmentWizard.viewRequestButton.click();
    await expect(standardUser.requestPage.statusValue, "The request's page shows the status Submitted and a Cancel request button.").toHaveText('Submitted');
    await expect(standardUser.requestPage.cancelRequestButton, "The request's page shows the status Submitted and a Cancel request button.").toBeVisible();
    return newRequestNumber;
  });

  await test.step('2. Enter the comment and select Post comment.', async () => {
    await standardUser.requestPage.commentTextarea.fill(commentText);
    await standardUser.requestPage.postCommentButton.click();
    await expect(standardUser.alertsPage.commentPostedAlert, 'The message "Comment posted." appears.').toBeVisible();
    await expect(standardUser.requestPage.historyList, 'The history lists the comment.').toContainText(commentText);
  });

  await test.step('3. Select Cancel request, then select Keep request.', async () => {
    await standardUser.requestPage.cancelRequestButton.click();
    await standardUser.cancelRequestDialog.dismissButton.click();
    await expect(standardUser.cancelRequestDialog.dialog, 'The dialog closes and the status is still Submitted.').toBeHidden();
    await expect(standardUser.requestPage.statusValue, 'The dialog closes and the status is still Submitted.').toHaveText('Submitted');
  });

  await test.step('4. Select Cancel request, then select Cancel request in the dialog.', async () => {
    await standardUser.requestPage.cancelRequestButton.click();
    await standardUser.cancelRequestDialog.confirmButton.click();
    await expect(standardUser.alertsPage.newestAlertMessage, 'The message "Cancelled <number>." appears.').toContainText(`Cancelled ${requestNumber}.`);
    await expect(standardUser.requestPage.statusValue, 'The status is Cancelled, and the page says the user cancelled it.').toHaveText('Cancelled');
    await expect(standardUser.requestPage.decisionAlert, 'The status is Cancelled, and the page says the user cancelled it.').toContainText(`Cancelled by ${standardUser.account.name}`);
    await expect(standardUser.requestPage.cancelRequestButton, "There's no Cancel request button.").toHaveCount(0);
  });
});
