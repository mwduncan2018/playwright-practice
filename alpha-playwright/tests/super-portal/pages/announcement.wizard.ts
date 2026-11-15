import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * The admins' New announcement wizard. Its choices, an audience or when to publish, are radio
 * buttons in the dialog. The Review step has a region for each step's answers, named after the step.
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
  }
}
