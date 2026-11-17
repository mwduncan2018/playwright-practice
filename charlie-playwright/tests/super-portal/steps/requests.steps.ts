import { expect, Then, When } from '../fixtures';

const commentText = 'Any full-size keyboard is fine.';

When('the standard user submits the keyboard request in the test data', async ({ standardUser }) => {
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
});

Then("the standard user sees that the request's page shows the status Submitted and a Cancel request button", async ({ standardUser }) => {
  await expect(standardUser.requestPage.statusValue, "The request's page shows the status Submitted and a Cancel request button.").toHaveText('Submitted');
  await expect(standardUser.requestPage.cancelRequestButton, "The request's page shows the status Submitted and a Cancel request button.").toBeVisible();
});

When('the standard user enters the comment and selects Post comment', async ({ standardUser }) => {
  await standardUser.requestPage.commentTextarea.fill(commentText);
  await standardUser.requestPage.postCommentButton.click();
});

Then('the standard user sees that the message "Comment posted." appears', async ({ standardUser }) => {
  await expect(standardUser.alertsPage.commentPostedAlert, 'The message "Comment posted." appears.').toBeVisible();
});

Then('the standard user sees that the history lists the comment', async ({ standardUser }) => {
  await expect(standardUser.requestPage.historyList, 'The history lists the comment.').toContainText(commentText);
});

When('the standard user selects Cancel request, then selects Keep request', async ({ standardUser }) => {
  await standardUser.requestPage.cancelRequestButton.click();
  await standardUser.cancelRequestDialog.dismissButton.click();
});

Then('the standard user sees that the dialog closes and the status is still Submitted', async ({ standardUser }) => {
  await expect(standardUser.cancelRequestDialog.dialog, 'The dialog closes and the status is still Submitted.').toBeHidden();
  await expect(standardUser.requestPage.statusValue, 'The dialog closes and the status is still Submitted.').toHaveText('Submitted');
});

When('the standard user selects Cancel request, then selects Cancel request in the dialog', async ({ standardUser }) => {
  await standardUser.requestPage.cancelRequestButton.click();
  await standardUser.cancelRequestDialog.confirmButton.click();
});

Then('the standard user sees that the message "Cancelled <number>." appears', async ({ standardUser, scenarioContext }) => {
  await expect(standardUser.alertsPage.newestAlertMessage, 'The message "Cancelled <number>." appears.').toContainText(`Cancelled ${scenarioContext.requestNumber}.`);
});

Then('the standard user sees that the status is Cancelled, and the page says the user cancelled it', async ({ standardUser }) => {
  await expect(standardUser.requestPage.statusValue, 'The status is Cancelled, and the page says the user cancelled it.').toHaveText('Cancelled');
  await expect(standardUser.requestPage.decisionAlert, 'The status is Cancelled, and the page says the user cancelled it.').toContainText(`Cancelled by ${standardUser.account.name}`);
});

Then("the standard user sees that there's no Cancel request button", async ({ standardUser }) => {
  await expect(standardUser.requestPage.cancelRequestButton, "There's no Cancel request button.").toHaveCount(0);
});
