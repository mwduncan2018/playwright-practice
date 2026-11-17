import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class RequestWizard extends BasePage {
  readonly dialog: Locator;
  readonly progressText: Locator;
  readonly stepsList: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly submitButton: Locator;
  readonly discardQuestionHeading: Locator;
  readonly keepEditingButton: Locator;
  readonly discardButton: Locator;
  readonly submittedHeading: Locator;
  readonly newRequestNumberText: Locator;
  readonly viewRequestButton: Locator;
  readonly doneButton: Locator;
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
  readonly deliverToMyDeskRadio: Locator;
  readonly shipToAnAddressRadio: Locator;
  readonly pickUpAtTheItDeskRadio: Locator;
  readonly oneMonthLicenseRadio: Locator;
  readonly sixMonthsLicenseRadio: Locator;
  readonly oneYearLicenseRadio: Locator;
  readonly readOnlyAccessRadio: Locator;
  readonly readAndWriteAccessRadio: Locator;
  readonly administratorAccessRadio: Locator;
  readonly lowPriorityRadio: Locator;
  readonly normalPriorityRadio: Locator;
  readonly highPriorityRadio: Locator;
  readonly urgentPriorityRadio: Locator;
  readonly equipmentReviewRegion: Locator;
  readonly deliveryReviewRegion: Locator;
  readonly softwareReviewRegion: Locator;
  readonly licenseReviewRegion: Locator;
  readonly systemAndAccessReviewRegion: Locator;
  readonly securityReviewRegion: Locator;
  readonly priorityAndReasonReviewRegion: Locator;
  readonly editEquipmentButton: Locator;
  readonly editDeliveryButton: Locator;
  readonly editSoftwareButton: Locator;
  readonly editLicenseButton: Locator;
  readonly editSystemAndAccessButton: Locator;
  readonly editSecurityReviewButton: Locator;
  readonly editPriorityAndReasonButton: Locator;

  constructor(page: Page, title: 'Request equipment' | 'Request software' | 'Request access' | RegExp) {
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
    this.doneButton = this.dialog.getByRole('button', { name: 'Done', exact: true });
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
