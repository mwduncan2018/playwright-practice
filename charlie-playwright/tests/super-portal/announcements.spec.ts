import { dateFromToday, uniqueSuffix } from '../../shared/test-data';
import { expect, plan, test } from './fixtures';

test('SP-009 Schedule an announcement for standard users', { tag: '@regression', annotation: plan('SP-009') }, async ({ adminUser, standardUser }) => {
  const announcementTitle = `Test announcement ${uniqueSuffix()}`;
  const publishDate = dateFromToday(3);

  await test.step('1. As the admin, open Announcements and select New announcement.', async () => {
    await adminUser.page.goto(adminUser.announcementsPage.path);
    await adminUser.announcementsPage.newAnnouncementButton.click();
    await expect(adminUser.announcementWizard.progressText, 'The New announcement wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
  });

  await test.step('2. Select Next without entering anything.', async () => {
    await adminUser.announcementWizard.nextButton.click();
    await expect(adminUser.announcementWizard.titleInput, 'Title says "Enter a title."').toHaveAccessibleErrorMessage('Enter a title.');
    await expect(adminUser.announcementWizard.messageTextarea, 'Message says "Enter the message."').toHaveAccessibleErrorMessage('Enter the message.');
  });

  await test.step('3. Enter the title and message and select Next. Choose the audience and select Next. Choose Schedule for a later date, enter the date, check the pin box, and select Next.', async () => {
    await adminUser.announcementWizard.titleInput.fill(announcementTitle);
    await adminUser.announcementWizard.messageTextarea.fill('The cafeteria opens an hour later on Friday.');
    await adminUser.announcementWizard.nextButton.click();
    await adminUser.announcementWizard.standardUsersOnlyAudienceRadio.check();
    await adminUser.announcementWizard.nextButton.click();
    await adminUser.announcementWizard.scheduleForLaterDateRadio.check();
    await adminUser.announcementWizard.publishOnInput.fill(publishDate);
    await adminUser.announcementWizard.pinnedCheckbox.check();
    await adminUser.announcementWizard.nextButton.click();
    await expect(adminUser.announcementWizard.audienceReviewRegion, 'The Review step shows "Standard users only" and the date at 09:00 UTC.').toContainText('Standard users only');
    await expect(adminUser.announcementWizard.publishingReviewRegion, 'The Review step shows "Standard users only" and the date at 09:00 UTC.').toContainText(`${publishDate} at 09:00 UTC`);
  });

  await test.step('4. Select Schedule announcement, then select View announcement.', async () => {
    await adminUser.announcementWizard.scheduleButton.click();
    await adminUser.announcementWizard.viewAnnouncementButton.click();
    await expect(adminUser.announcementPage.bylineText, "The announcement's page says it's scheduled.").toContainText('Scheduled for');
    await expect(adminUser.announcementPage.audienceBadge, 'The audience is "Standard users only".').toHaveText('Standard users only');
  });

  await test.step('5. As the standard user, open Announcements.', async () => {
    await standardUser.page.goto(standardUser.announcementsPage.path);
    await expect(standardUser.announcementsPage.summaryText).toBeVisible();
    await expect(standardUser.announcementsPage.announcementLink(announcementTitle), "The announcement isn't listed.").toHaveCount(0);
  });

  await test.step('6. As the admin, delete the announcement.', async () => {
    await adminUser.announcementPage.deleteButton.click();
    await adminUser.deleteAnnouncementDialog.confirmButton.click();
    await expect(adminUser.alertsPage.announcementDeletedAlert, 'The message "Deleted the announcement." appears.').toBeVisible();
  });
});
