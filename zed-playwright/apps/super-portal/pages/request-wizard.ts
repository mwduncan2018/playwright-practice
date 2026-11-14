import type { Locator, Page } from '@playwright/test';

export type DeliveryMethod = 'Deliver to my desk' | 'Ship to an address' | 'Pick up at the IT desk';

/** What the Priority and reason step asks. Priority keeps the user's default when left out. */
interface Finish {
  priority?: string;
  reason: string;
}

export interface EquipmentRequest extends Finish {
  item: string;
  quantity: string;
  delivery: DeliveryMethod;
  address?: string;
}

export interface SoftwareRequest extends Finish {
  software: string;
  license: string;
  seats: string;
}

export interface AccessRequest extends Finish {
  system: string;
  level: string;
  /** Only for Administrator access, which adds the Security review step. */
  securityReason?: string;
}

/** A request wizard: the Request equipment, Request software or Request access dialog. */
export class RequestWizard {
  readonly dialog: Locator;
  /** "Step 2 of 4" */
  readonly progress: Locator;
  /** The list of steps at the top. */
  readonly steps: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly cancelButton: Locator;
  /** The X at the top right. */
  readonly closeButton: Locator;
  readonly submitButton: Locator;
  readonly discardQuestion: Locator;
  readonly keepEditingButton: Locator;
  readonly discardButton: Locator;
  readonly submittedHeading: Locator;
  /** The new request's number, which carries a test ID because nothing else names it. */
  readonly newRequestNumber: Locator;
  readonly viewRequestButton: Locator;
  readonly item: Locator;
  readonly quantity: Locator;
  readonly address: Locator;
  readonly software: Locator;
  readonly seats: Locator;
  readonly system: Locator;
  readonly securityReason: Locator;
  readonly trainingCompleted: Locator;
  readonly neededBy: Locator;
  readonly reason: Locator;

  constructor(
    readonly page: Page,
    title: 'Request equipment' | 'Request software' | 'Request access',
  ) {
    this.dialog = page.getByRole('dialog', { name: title });
    this.progress = this.dialog.getByText(/^Step \d+ of \d+$/);
    this.steps = this.dialog.getByRole('list', { name: 'Steps' });
    this.nextButton = this.dialog.getByRole('button', { name: 'Next', exact: true });
    this.backButton = this.dialog.getByRole('button', { name: 'Back', exact: true });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close', exact: true });
    this.submitButton = this.dialog.getByRole('button', { name: 'Submit request' });
    this.discardQuestion = this.dialog.getByRole('heading', { name: 'Discard this request?' });
    this.keepEditingButton = this.dialog.getByRole('button', { name: 'Keep editing' });
    this.discardButton = this.dialog.getByRole('button', { name: 'Discard', exact: true });
    this.submittedHeading = this.dialog.getByRole('heading', { name: 'Request submitted' });
    this.newRequestNumber = this.dialog.getByTestId('new-request-number');
    this.viewRequestButton = this.dialog.getByRole('button', { name: 'View request' });
    this.item = this.dialog.getByLabel('Item');
    this.quantity = this.dialog.getByLabel('Quantity');
    this.address = this.dialog.getByLabel('Delivery address');
    this.software = this.dialog.getByLabel('Software');
    this.seats = this.dialog.getByLabel('Seats');
    this.system = this.dialog.getByLabel('System', { exact: true });
    this.securityReason = this.dialog.getByLabel('Why do you need administrator access?');
    this.trainingCompleted = this.dialog.getByLabel("I've completed this year's security training.");
    this.neededBy = this.dialog.getByLabel('Needed by (optional)');
    this.reason = this.dialog.getByLabel('Why do you need this?');
  }

  /** A radio button: a delivery method, license length, access level or priority. */
  option(name: string): Locator {
    return this.dialog.getByRole('radio', { name, exact: true });
  }

  /** One step's answers on the Review step, such as "Delivery". */
  reviewSection(stepTitle: string): Locator {
    return this.dialog.getByRole('region', { name: stepTitle });
  }

  /** The Review step's Edit button for a step, which goes back to it. */
  editButton(stepTitle: string): Locator {
    return this.dialog.getByRole('button', { name: `Edit ${stepTitle}` });
  }

  /** The number shown once the request is submitted, such as REQ-1021. */
  async requestNumber(): Promise<string> {
    await this.newRequestNumber.waitFor();
    return (await this.newRequestNumber.innerText()).trim();
  }

  async submitEquipment(request: EquipmentRequest): Promise<void> {
    await this.item.selectOption(request.item);
    await this.quantity.fill(request.quantity);
    await this.nextButton.click();
    await this.option(request.delivery).check();
    if (request.address !== undefined) await this.address.fill(request.address);
    await this.nextButton.click();
    await this.finish(request);
  }

  async submitSoftware(request: SoftwareRequest): Promise<void> {
    await this.software.selectOption(request.software);
    await this.nextButton.click();
    await this.option(request.license).check();
    await this.seats.fill(request.seats);
    await this.nextButton.click();
    await this.finish(request);
  }

  async submitAccess(request: AccessRequest): Promise<void> {
    await this.system.selectOption(request.system);
    await this.option(request.level).check();
    await this.nextButton.click();
    if (request.securityReason !== undefined) {
      await this.securityReason.fill(request.securityReason);
      await this.trainingCompleted.check();
      await this.nextButton.click();
    }
    await this.finish(request);
  }

  /** The Priority and reason step, then Submit request on the Review step. */
  private async finish({ priority, reason }: Finish): Promise<void> {
    if (priority) await this.option(priority).check();
    await this.reason.fill(reason);
    await this.nextButton.click();
    await this.submitButton.click();
  }
}
