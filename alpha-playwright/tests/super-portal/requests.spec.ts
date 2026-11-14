import { expect, plan, test } from './fixtures';

test(
  'SP-005 Comment on and cancel your request',
  { tag: '@regression', annotation: plan('SP-005') },
  async ({ page, portal, user }) => {
    const { request } = portal;
    const wizard = portal.equipmentWizard;
    const comment = 'Any full-size keyboard is fine.';

    const requestNumber =
      await test.step('1. Submit the request in the test data, then select View request.', async () => {
        await page.goto(portal.newRequest.path);
        await portal.newRequest.requestEquipment.click();
        await wizard.item.selectOption('Keyboard');
        await wizard.quantity.fill('1');
        await wizard.nextButton.click();
        await wizard.dialog.getByRole('radio', { name: 'Deliver to my desk', exact: true }).check();
        await wizard.nextButton.click();
        await wizard.reason.fill('The keys on my keyboard stick.');
        await wizard.nextButton.click();
        await wizard.submitButton.click();
        const number = (await wizard.newRequestNumber.innerText()).trim();
        await wizard.viewRequestButton.click();
        const shows = "The request's page shows the status Submitted and a Cancel request button.";
        await expect(request.status, shows).toHaveText('Submitted');
        await expect(request.cancelRequestButton, shows).toBeVisible();
        return number;
      });

    await test.step('2. Enter the comment and select Post comment.', async () => {
      await request.commentField.fill(comment);
      await request.postCommentButton.click();
      await expect(
        portal.layout.alerts.filter({ hasText: 'Comment posted.' }),
        'The message "Comment posted." appears.',
      ).toBeVisible();
      await expect(request.history, 'The history lists the comment.').toContainText(comment);
    });

    await test.step('3. Select Cancel request, then select Keep request.', async () => {
      await request.cancelRequestButton.click();
      await request.cancelDialog.dismissButton.click();
      const unchanged = 'The dialog closes and the status is still Submitted.';
      await expect(request.cancelDialog.dialog, unchanged).toBeHidden();
      await expect(request.status, unchanged).toHaveText('Submitted');
    });

    await test.step('4. Select Cancel request, then select Cancel request in the dialog.', async () => {
      await request.cancelRequestButton.click();
      await request.cancelDialog.confirmButton.click();
      await expect(
        portal.layout.alerts.filter({ hasText: `Cancelled ${requestNumber}.` }),
        'The message "Cancelled <number>." appears.',
      ).toBeVisible();
      const cancelled = 'The status is Cancelled, and the page says the user cancelled it.';
      await expect(request.status, cancelled).toHaveText('Cancelled');
      await expect(request.decision, cancelled).toContainText(`Cancelled by ${user.name}`);
      await expect(request.cancelRequestButton, "There's no Cancel request button.").toHaveCount(0);
    });
  },
);
