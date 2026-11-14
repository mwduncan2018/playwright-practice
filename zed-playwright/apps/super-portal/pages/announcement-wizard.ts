import type { Locator, Page } from '@playwright/test';

/** The admins' New announcement wizard. */
export class AnnouncementWizard {
  readonly dialog: Locator;
  /** "Step 2 of 4" */
  readonly progress: Locator;
  readonly nextButton: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly publishOn: Locator;
  readonly pinned: Locator;
  readonly scheduledHeading: Locator;
  readonly publishedHeading: Locator;
  readonly viewAnnouncementButton: Locator;

  constructor(readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New announcement' });
    this.progress = this.dialog.getByText(/^Step \d+ of \d+$/);
    this.nextButton = this.dialog.getByRole('button', { name: 'Next', exact: true });
    this.title = this.dialog.getByLabel('Title');
    this.message = this.dialog.getByLabel('Message');
    this.publishOn = this.dialog.getByLabel('Publish on');
    this.pinned = this.dialog.getByLabel('Pin it to the top of Home and Announcements');
    this.scheduledHeading = this.dialog.getByRole('heading', { name: 'Announcement scheduled' });
    this.publishedHeading = this.dialog.getByRole('heading', { name: 'Announcement published' });
    this.viewAnnouncementButton = this.dialog.getByRole('button', { name: 'View announcement' });
  }

  /** A radio button: an audience, or when to publish. */
  option(name: string): Locator {
    return this.dialog.getByRole('radio', { name, exact: true });
  }

  /** One step's answers on the Review step, such as "Audience". */
  reviewSection(stepTitle: string): Locator {
    return this.dialog.getByRole('region', { name: stepTitle });
  }

  /** "Publish announcement", or "Schedule announcement" for a later date. */
  submitButton(label: 'Publish announcement' | 'Schedule announcement'): Locator {
    return this.dialog.getByRole('button', { name: label });
  }
}
