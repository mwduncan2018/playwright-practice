import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The admins' New announcement wizard. Its choices, an audience or when to publish, are radio
 * buttons in a group named by the group's question. The Review step has a region for each step's
 * answers, named after the step, and an "Edit <step>" button for each.
 */
export class AnnouncementWizard extends BasePage {
  readonly dialog: Locator;
  /** "Step 2 of 4" */
  readonly progressText: Locator;
  readonly nextButton: Locator;
  readonly titleInput: Locator;
  readonly messageTextarea: Locator;
  readonly publishOnInput: Locator;
  readonly pinnedCheckbox: Locator;
  readonly publishButton: Locator;
  /** The Review step's button for an announcement with a later date. */
  readonly scheduleButton: Locator;
  readonly scheduledHeading: Locator;
  readonly publishedHeading: Locator;
  readonly viewAnnouncementButton: Locator;
  // Who should see it?
  readonly everyoneAudienceRadio: Locator;
  readonly adminsOnlyAudienceRadio: Locator;
  readonly standardUsersOnlyAudienceRadio: Locator;
  // When should it appear?
  readonly publishNowRadio: Locator;
  readonly scheduleForLaterDateRadio: Locator;
  // The Review step's answers for each step.
  readonly messageReviewRegion: Locator;
  readonly audienceReviewRegion: Locator;
  readonly publishingReviewRegion: Locator;
  // The Review step's Edit button for each step, which goes back to that step.
  readonly editMessageButton: Locator;
  readonly editAudienceButton: Locator;
  readonly editPublishingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.getByRole('dialog', { name: 'New announcement' });
    this.progressText = this.dialog.getByText(/^Step \d+ of \d+$/);
    this.nextButton = this.dialog.getByRole('button', { name: 'Next', exact: true });
    this.titleInput = this.dialog.getByLabel('Title');
    this.messageTextarea = this.dialog.getByLabel('Message');
    this.publishOnInput = this.dialog.getByLabel('Publish on');
    this.pinnedCheckbox = this.dialog.getByLabel('Pin it to the top of Home and Announcements');
    this.publishButton = this.dialog.getByRole('button', { name: 'Publish announcement' });
    this.scheduleButton = this.dialog.getByRole('button', { name: 'Schedule announcement' });
    this.scheduledHeading = this.dialog.getByRole('heading', { name: 'Announcement scheduled' });
    this.publishedHeading = this.dialog.getByRole('heading', { name: 'Announcement published' });
    this.viewAnnouncementButton = this.dialog.getByRole('button', { name: 'View announcement' });

    // Each radio button is found inside its group, the fieldset named by the group's question.
    const radioInGroup = (groupQuestion: string, radioLabel: string) =>
      this.dialog
        .getByRole('group', { name: groupQuestion, exact: true })
        .getByRole('radio', { name: radioLabel, exact: true });
    this.everyoneAudienceRadio = radioInGroup('Who should see it?', 'Everyone');
    this.adminsOnlyAudienceRadio = radioInGroup('Who should see it?', 'Admins only');
    this.standardUsersOnlyAudienceRadio = radioInGroup('Who should see it?', 'Standard users only');
    this.publishNowRadio = radioInGroup('When should it appear?', 'Publish now');
    this.scheduleForLaterDateRadio = radioInGroup('When should it appear?', 'Schedule for a later date');

    // Each step's region on the Review step is named after the step, and so is its Edit button.
    const reviewRegion = (stepTitle: string) => this.dialog.getByRole('region', { name: stepTitle, exact: true });
    const editStepButton = (stepTitle: string) =>
      this.dialog.getByRole('button', { name: `Edit ${stepTitle}`, exact: true });
    this.messageReviewRegion = reviewRegion('Message');
    this.audienceReviewRegion = reviewRegion('Audience');
    this.publishingReviewRegion = reviewRegion('Publishing');
    this.editMessageButton = editStepButton('Message');
    this.editAudienceButton = editStepButton('Audience');
    this.editPublishingButton = editStepButton('Publishing');
  }
}
