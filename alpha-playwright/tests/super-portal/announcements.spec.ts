import { dateFromToday, uniqueSuffix } from '../../shared/test-data';
import { expect, plan, test } from './fixtures';

test.use({ signedInAs: 'admin' });

test(
  'SP-009 Schedule an announcement for standard users',
  { tag: '@regression', annotation: plan('SP-009') },
  async ({ portal, openPortalAs }) => {
    const { announcements, announcement } = portal;
    const wizard = announcements.wizard;
    const title = `Test announcement ${uniqueSuffix()}`;
    const publishOn = dateFromToday(3);

    await test.step('1. As the admin, open Announcements and select New announcement.', async () => {
      await announcements.goto();
      await announcements.newAnnouncementButton.click();
      await expect(wizard.progress, 'The New announcement wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
    });

    await test.step('2. Select Next without entering anything.', async () => {
      await wizard.nextButton.click();
      await expect(wizard.title, 'Title says "Enter a title."').toHaveAccessibleErrorMessage('Enter a title.');
      await expect(wizard.message, 'Message says "Enter the message."').toHaveAccessibleErrorMessage(
        'Enter the message.',
      );
    });

    await test.step('3. Enter the title and message and select Next. Choose the audience and select Next. Choose Schedule for a later date, enter the date, check the pin box, and select Next.', async () => {
      await wizard.title.fill(title);
      await wizard.message.fill('The cafeteria opens an hour later on Friday.');
      await wizard.nextButton.click();
      await wizard.option('Standard users only').check();
      await wizard.nextButton.click();
      await wizard.option('Schedule for a later date').check();
      await wizard.publishOn.fill(publishOn);
      await wizard.pinned.check();
      await wizard.nextButton.click();
      const review = 'The Review step shows "Standard users only" and the date at 09:00 UTC.';
      await expect(wizard.reviewSection('Audience'), review).toContainText('Standard users only');
      await expect(wizard.reviewSection('Publishing'), review).toContainText(`${publishOn} at 09:00 UTC`);
    });

    await test.step('4. Select Schedule announcement, then select View announcement.', async () => {
      await wizard.submitButton('Schedule announcement').click();
      await wizard.viewAnnouncementButton.click();
      await expect(announcement.meta, "The announcement's page says it's scheduled.").toContainText('Scheduled for');
      await expect(announcement.audience, 'The audience is "Standard users only".').toHaveText('Standard users only');
    });

    await test.step('5. As the standard user, open Announcements.', async () => {
      const standardUser = await openPortalAs('standard');
      await standardUser.announcements.goto();
      // Wait for the list, so the check below isn't made before it has loaded.
      await expect(standardUser.announcements.summary).toBeVisible();
      await expect(standardUser.announcements.announcementLink(title), "The announcement isn't listed.").toHaveCount(0);
    });

    await test.step('6. As the admin, delete the announcement.', async () => {
      await announcement.deleteButton.click();
      await announcement.deleteDialog.confirmButton.click();
      await expect(
        portal.layout.message('Deleted the announcement.'),
        'The message "Deleted the announcement." appears.',
      ).toBeVisible();
    });
  },
);
