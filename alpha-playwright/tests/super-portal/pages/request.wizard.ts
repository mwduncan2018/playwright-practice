import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

/**
 * A request wizard: the Request equipment, Request software or Request access dialog. Its choices,
 * such as a delivery method, license length, access level or priority, are radio buttons in a group
 * named by the group's question. The Review step has a region for each step's answers, named after
 * the step, and an "Edit <step>" button for each. The three wizards share this class, so each has
 * the locators of the others too; they just don't match anything in that wizard.
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
  // How do you want to get it? (Request equipment)
  readonly deliverToMyDeskRadio: Locator;
  readonly shipToAnAddressRadio: Locator;
  readonly pickUpAtTheItDeskRadio: Locator;
  // License length (Request software)
  readonly oneMonthLicenseRadio: Locator;
  readonly sixMonthsLicenseRadio: Locator;
  readonly oneYearLicenseRadio: Locator;
  // Access level (Request access)
  readonly readOnlyAccessRadio: Locator;
  readonly readAndWriteAccessRadio: Locator;
  readonly administratorAccessRadio: Locator;
  // Priority (every wizard)
  readonly lowPriorityRadio: Locator;
  readonly normalPriorityRadio: Locator;
  readonly highPriorityRadio: Locator;
  readonly urgentPriorityRadio: Locator;
  // The Review step's answers for each step.
  readonly equipmentReviewRegion: Locator;
  readonly deliveryReviewRegion: Locator;
  readonly softwareReviewRegion: Locator;
  readonly licenseReviewRegion: Locator;
  readonly systemAndAccessReviewRegion: Locator;
  readonly securityReviewRegion: Locator;
  readonly priorityAndReasonReviewRegion: Locator;
  // The Review step's Edit button for each step, which goes back to that step.
  readonly editEquipmentButton: Locator;
  readonly editDeliveryButton: Locator;
  readonly editSoftwareButton: Locator;
  readonly editLicenseButton: Locator;
  readonly editSystemAndAccessButton: Locator;
  readonly editSecurityReviewButton: Locator;
  readonly editPriorityAndReasonButton: Locator;

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

    // Each radio button is found inside its group, the fieldset named by the group's question.
    const radioInGroup = (groupQuestion: string, radioLabel: string) =>
      this.dialog
        .getByRole('group', { name: groupQuestion, exact: true })
        .getByRole('radio', { name: radioLabel, exact: true });
    this.deliverToMyDeskRadio = radioInGroup('How do you want to get it?', 'Deliver to my desk');
    this.shipToAnAddressRadio = radioInGroup('How do you want to get it?', 'Ship to an address');
    this.pickUpAtTheItDeskRadio = radioInGroup('How do you want to get it?', 'Pick up at the IT desk');
    this.oneMonthLicenseRadio = radioInGroup('License length', '1 month');
    this.sixMonthsLicenseRadio = radioInGroup('License length', '6 months');
    this.oneYearLicenseRadio = radioInGroup('License length', '1 year');
    this.readOnlyAccessRadio = radioInGroup('Access level', 'Read only');
    this.readAndWriteAccessRadio = radioInGroup('Access level', 'Read and write');
    this.administratorAccessRadio = radioInGroup('Access level', 'Administrator');
    this.lowPriorityRadio = radioInGroup('Priority', 'Low');
    this.normalPriorityRadio = radioInGroup('Priority', 'Normal');
    this.highPriorityRadio = radioInGroup('Priority', 'High');
    this.urgentPriorityRadio = radioInGroup('Priority', 'Urgent');

    // Each step's region on the Review step is named after the step, and so is its Edit button.
    const reviewRegion = (stepTitle: string) => this.dialog.getByRole('region', { name: stepTitle, exact: true });
    const editStepButton = (stepTitle: string) =>
      this.dialog.getByRole('button', { name: `Edit ${stepTitle}`, exact: true });
    this.equipmentReviewRegion = reviewRegion('Equipment');
    this.deliveryReviewRegion = reviewRegion('Delivery');
    this.softwareReviewRegion = reviewRegion('Software');
    this.licenseReviewRegion = reviewRegion('License');
    this.systemAndAccessReviewRegion = reviewRegion('System and access');
    this.securityReviewRegion = reviewRegion('Security review');
    this.priorityAndReasonReviewRegion = reviewRegion('Priority and reason');
    this.editEquipmentButton = editStepButton('Equipment');
    this.editDeliveryButton = editStepButton('Delivery');
    this.editSoftwareButton = editStepButton('Software');
    this.editLicenseButton = editStepButton('License');
    this.editSystemAndAccessButton = editStepButton('System and access');
    this.editSecurityReviewButton = editStepButton('Security review');
    this.editPriorityAndReasonButton = editStepButton('Priority and reason');
  }
}
