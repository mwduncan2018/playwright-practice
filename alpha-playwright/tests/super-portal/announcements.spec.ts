import { dateFromToday, uniqueSuffix } from '../../shared/test-data';
import { expect, plan, test } from './fixtures';

test('SP-009 Schedule an announcement for standard users', { tag: '@regression', annotation: plan('SP-009') }, async ({ admin, standard }) => {
  const title = `Test announcement ${uniqueSuffix()}`;
  const publishOn = dateFromToday(3);

  await test.step('1. As the admin, open Announcements and select New announcement.', async () => {
    await admin.page.goto(admin.announcements.path);
    await admin.announcements.newAnnouncementButton.click();
    await expect(
      admin.announcementWizard.progress,
      'The New announcement wizard opens at "Step 1 of 4".',
    ).toHaveText('Step 1 of 4');
  });

  await test.step('2. Select Next without entering anything.', async () => {
    await admin.announcementWizard.nextButton.click();
    await expect(admin.announcementWizard.title, 'Title says "Enter a title."').toHaveAccessibleErrorMessage(
      'Enter a title.',
    );
    await expect(
      admin.announcementWizard.message,
      'Message says "Enter the message."',
    ).toHaveAccessibleErrorMessage('Enter the message.');
  });

  await test.step('3. Enter the title and message and select Next. Choose the audience and select Next. Choose Schedule for a later date, enter the date, check the pin box, and select Next.', async () => {
    await admin.announcementWizard.title.fill(title);
    await admin.announcementWizard.message.fill('The cafeteria opens an hour later on Friday.');
    await admin.announcementWizard.nextButton.click();
    await admin.announcementWizard.dialog.getByRole('radio', { name: 'Standard users only', exact: true }).check();
    await admin.announcementWizard.nextButton.click();
    await admin.announcementWizard.dialog
      .getByRole('radio', { name: 'Schedule for a later date', exact: true })
      .check();
    await admin.announcementWizard.publishOn.fill(publishOn);
    await admin.announcementWizard.pinned.check();
    await admin.announcementWizard.nextButton.click();
    const review = 'The Review step shows "Standard users only" and the date at 09:00 UTC.';
    await expect(admin.announcementWizard.dialog.getByRole('region', { name: 'Audience' }), review).toContainText(
      'Standard users only',
    );
    await expect(admin.announcementWizard.dialog.getByRole('region', { name: 'Publishing' }), review).toContainText(
      `${publishOn} at 09:00 UTC`,
    );
  });

  await test.step('4. Select Schedule announcement, then select View announcement.', async () => {
    await admin.announcementWizard.scheduleButton.click();
    await admin.announcementWizard.viewAnnouncementButton.click();
    await expect(admin.announcement.meta, "The announcement's page says it's scheduled.").toContainText(
      'Scheduled for',
    );
    await expect(admin.announcement.audience, 'The audience is "Standard users only".').toHaveText(
      'Standard users only',
    );
  });

  await test.step('5. As the standard user, open Announcements.', async () => {
    await standard.page.goto(standard.announcements.path);
    // Wait for the list, so the check below isn't made before it has loaded.
    await expect(standard.announcements.summary).toBeVisible();
    await expect(standard.announcements.announcementLink(title), "The announcement isn't listed.").toHaveCount(0);
  });

  await test.step('6. As the admin, delete the announcement.', async () => {
    await admin.announcement.deleteButton.click();
    await admin.deleteAnnouncementDialog.confirmButton.click();
    await expect(
      admin.layout.alerts.filter({ hasText: 'Deleted the announcement.' }),
      'The message "Deleted the announcement." appears.',
    ).toBeVisible();
  });
});
