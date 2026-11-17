import { expect, Then, When } from '../fixtures';

When('the admin user opens Announcements and selects New announcement', async ({ adminUser }) => {
  await adminUser.navbarPage.announcementsLink.click();
  await adminUser.announcementsPage.newAnnouncementButton.click();
});

Then('the admin user sees that the New announcement wizard opens at "Step 1 of 4"', async ({ adminUser }) => {
  await expect(adminUser.announcementWizard.progressText, 'The New announcement wizard opens at "Step 1 of 4".').toHaveText('Step 1 of 4');
});

When('the admin user selects Next without entering anything', async ({ adminUser }) => {
  await adminUser.announcementWizard.nextButton.click();
});

Then('the admin user sees that Title says "Enter a title."', async ({ adminUser }) => {
  await expect(adminUser.announcementWizard.titleInput, 'Title says "Enter a title."').toHaveAccessibleErrorMessage('Enter a title.');
});

Then('the admin user sees that Message says "Enter the message."', async ({ adminUser }) => {
  await expect(adminUser.announcementWizard.messageTextarea, 'Message says "Enter the message."').toHaveAccessibleErrorMessage('Enter the message.');
});

When('the admin user enters the title and message and selects Next, chooses the audience and selects Next, then chooses Schedule for a later date, enters the date, checks the pin box, and selects Next', async ({ adminUser, testAnnouncement }) => {
  await adminUser.announcementWizard.titleInput.fill(testAnnouncement.title);
  await adminUser.announcementWizard.messageTextarea.fill(testAnnouncement.message);
  await adminUser.announcementWizard.nextButton.click();
  await adminUser.announcementWizard.standardUsersOnlyAudienceRadio.check();
  await adminUser.announcementWizard.nextButton.click();
  await adminUser.announcementWizard.scheduleForLaterDateRadio.check();
  await adminUser.announcementWizard.publishOnInput.fill(testAnnouncement.publishDate);
  await adminUser.announcementWizard.pinnedCheckbox.check();
  await adminUser.announcementWizard.nextButton.click();
});

Then('the admin user sees that the Review step shows "Standard users only" and the date at 09:00 UTC', async ({ adminUser, testAnnouncement }) => {
  await expect(adminUser.announcementWizard.audienceReviewRegion, 'The Review step shows "Standard users only" and the date at 09:00 UTC.').toContainText('Standard users only');
  await expect(adminUser.announcementWizard.publishingReviewRegion, 'The Review step shows "Standard users only" and the date at 09:00 UTC.').toContainText(`${testAnnouncement.publishDate} at 09:00 UTC`);
});

When('the admin user selects Schedule announcement, then selects View announcement', async ({ adminUser }) => {
  await adminUser.announcementWizard.scheduleButton.click();
  await adminUser.announcementWizard.viewAnnouncementButton.click();
});

Then("the admin user sees that the announcement's page says it's scheduled", async ({ adminUser }) => {
  await expect(adminUser.announcementPage.bylineText, "The announcement's page says it's scheduled.").toContainText('Scheduled for');
});

Then('the admin user sees that the audience is "Standard users only"', async ({ adminUser }) => {
  await expect(adminUser.announcementPage.audienceBadge, 'The audience is "Standard users only".').toHaveText('Standard users only');
});

When('the standard user opens Announcements', async ({ standardUser }) => {
  await standardUser.navbarPage.announcementsLink.click();
});

Then("the standard user sees that the announcement isn't listed", async ({ standardUser, testAnnouncement }) => {
  await expect(standardUser.announcementsPage.summaryText).toBeVisible();
  await expect(standardUser.announcementsPage.announcementLink(testAnnouncement.title), "The announcement isn't listed.").toHaveCount(0);
});

When('the admin user deletes the announcement', async ({ adminUser }) => {
  await adminUser.announcementPage.deleteButton.click();
  await adminUser.deleteAnnouncementDialog.confirmButton.click();
});

Then('the admin user sees that the message "Deleted the announcement." appears', async ({ adminUser }) => {
  await expect(adminUser.alertsPage.announcementDeletedAlert, 'The message "Deleted the announcement." appears.').toBeVisible();
});
