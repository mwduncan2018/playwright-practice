import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * A request wizard: the Request equipment, Request software or Request access dialog. Its choices,
 * such as a delivery method, license length, access level or priority, are radio buttons in the
 * dialog. The Review step has a region for each step's answers, named after the step, and an
 * "Edit <step>" button for each.
 */
export class RequestWizard extends BasePage {
  readonly dialog: Locator;
  /** "Step 2 of 4" */
  readonly progressText: Locator;
  /** The list of steps at the top. */
  readonly stepsList: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly cancelButton: Locator;
  /** The X at the top right. */
  readonly closeButton: Locator;
  readonly submitButton: Locator;
  readonly discardQuestionHeading: Locator;
  readonly keepEditingButton: Locator;
  readonly discardButton: Locator;
  readonly submittedHeading: Locator;
  /** The new request's number, such as REQ-1021, which carries a test ID because nothing else names it. */
  readonly newRequestNumberText: Locator;
  readonly viewRequestButton: Locator;
  readonly itemSelect: Locator;
  readonly quantityInput: Locator;
  readonly deliveryAddressTextarea: Locator;
  readonly softwareSelect: Locator;
  readonly seatsInput: Locator;
  readonly systemSelect: Locator;
  readonly securityReasonTextarea: Locator;
  readonly trainingCompletedCheckbox: Locator;
  readonly neededByInput: Locator;
  readonly reasonTextarea: Locator;

  constructor(page: Page, title: 'Request equipment' | 'Request software' | 'Request access') {
    super(page);
    this.dialog = page.getByRole('dialog', { name: title });
    this.progressText = this.dialog.getByText(/^Step \d+ of \d+$/);
    this.stepsList = this.dialog.getByRole('list', { name: 'Steps' });
    this.nextButton = this.dialog.getByRole('button', { name: 'Next', exact: true });
    this.backButton = this.dialog.getByRole('button', { name: 'Back', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close', exact: true });
    this.submitButton = this.dialog.getByRole('button', { name: 'Submit request' });
    this.discardQuestionHeading = this.dialog.getByRole('heading', { name: 'Discard this request?' });
    this.keepEditingButton = this.dialog.getByRole('button', { name: 'Keep editing' });
    this.discardButton = this.dialog.getByRole('button', { name: 'Discard', exact: true });
    this.submittedHeading = this.dialog.getByRole('heading', { name: 'Request submitted' });
    this.newRequestNumberText = this.dialog.getByTestId('new-request-number');
    this.viewRequestButton = this.dialog.getByRole('button', { name: 'View request' });
    this.itemSelect = this.dialog.getByLabel('Item');
    this.quantityInput = this.dialog.getByLabel('Quantity');
    this.deliveryAddressTextarea = this.dialog.getByLabel('Delivery address');
    this.softwareSelect = this.dialog.getByLabel('Software');
    this.seatsInput = this.dialog.getByLabel('Seats');
    this.systemSelect = this.dialog.getByLabel('System', { exact: true });
    this.securityReasonTextarea = this.dialog.getByLabel('Why do you need administrator access?');
    this.trainingCompletedCheckbox = this.dialog.getByLabel("I've completed this year's security training.");
    this.neededByInput = this.dialog.getByLabel('Needed by (optional)');
    this.reasonTextarea = this.dialog.getByLabel('Why do you need this?');
  }
}
