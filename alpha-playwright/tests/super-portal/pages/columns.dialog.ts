import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class ColumnsDialog extends BasePage {
  readonly dialog: Locator;
  readonly closeButton: Locator;
  readonly numberColumnCheckbox: Locator;
  readonly titleColumnCheckbox: Locator;
  readonly typeColumnCheckbox: Locator;
  readonly requesterColumnCheckbox: Locator;
  readonly priorityColumnCheckbox: Locator;
  readonly statusColumnCheckbox: Locator;
  readonly submittedColumnCheckbox: Locator;
  readonly neededByColumnCheckbox: Locator;
  readonly updatedColumnCheckbox: Locator;
  readonly decidedByColumnCheckbox: Locator;
  readonly moveNumberUpButton: Locator;
  readonly moveNumberDownButton: Locator;
  readonly moveTitleUpButton: Locator;
  readonly moveTitleDownButton: Locator;
  readonly moveTypeUpButton: Locator;
  readonly moveTypeDownButton: Locator;
  readonly moveRequesterUpButton: Locator;
  readonly moveRequesterDownButton: Locator;
  readonly movePriorityUpButton: Locator;
  readonly movePriorityDownButton: Locator;
  readonly moveStatusUpButton: Locator;
  readonly moveStatusDownButton: Locator;
  readonly moveSubmittedUpButton: Locator;
  readonly moveSubmittedDownButton: Locator;
  readonly moveNeededByUpButton: Locator;
  readonly moveNeededByDownButton: Locator;
  readonly moveUpdatedUpButton: Locator;
  readonly moveUpdatedDownButton: Locator;
  readonly moveDecidedByUpButton: Locator;
  readonly moveDecidedByDownButton: Locator;
  readonly resetToDefaultButton: Locator;
  readonly cancelButton: Locator;
  readonly saveColumnsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dialog = page.getByRole('dialog', { name: 'Choose columns' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close', exact: true });

    const columnCheckbox = (columnName: string) => this.dialog.getByRole('checkbox', { name: columnName, exact: true });
    this.numberColumnCheckbox = columnCheckbox('Number');
    this.titleColumnCheckbox = columnCheckbox('Title');
    this.typeColumnCheckbox = columnCheckbox('Type');
    this.requesterColumnCheckbox = columnCheckbox('Requester');
    this.priorityColumnCheckbox = columnCheckbox('Priority');
    this.statusColumnCheckbox = columnCheckbox('Status');
    this.submittedColumnCheckbox = columnCheckbox('Submitted');
    this.neededByColumnCheckbox = columnCheckbox('Needed by');
    this.updatedColumnCheckbox = columnCheckbox('Updated');
    this.decidedByColumnCheckbox = columnCheckbox('Decided by');

    const moveColumnButton = (columnName: string, direction: 'up' | 'down') =>
      this.dialog.getByRole('button', { name: `Move ${columnName} ${direction}`, exact: true });
    this.moveNumberUpButton = moveColumnButton('Number', 'up');
    this.moveNumberDownButton = moveColumnButton('Number', 'down');
    this.moveTitleUpButton = moveColumnButton('Title', 'up');
    this.moveTitleDownButton = moveColumnButton('Title', 'down');
    this.moveTypeUpButton = moveColumnButton('Type', 'up');
    this.moveTypeDownButton = moveColumnButton('Type', 'down');
    this.moveRequesterUpButton = moveColumnButton('Requester', 'up');
    this.moveRequesterDownButton = moveColumnButton('Requester', 'down');
    this.movePriorityUpButton = moveColumnButton('Priority', 'up');
    this.movePriorityDownButton = moveColumnButton('Priority', 'down');
    this.moveStatusUpButton = moveColumnButton('Status', 'up');
    this.moveStatusDownButton = moveColumnButton('Status', 'down');
    this.moveSubmittedUpButton = moveColumnButton('Submitted', 'up');
    this.moveSubmittedDownButton = moveColumnButton('Submitted', 'down');
    this.moveNeededByUpButton = moveColumnButton('Needed by', 'up');
    this.moveNeededByDownButton = moveColumnButton('Needed by', 'down');
    this.moveUpdatedUpButton = moveColumnButton('Updated', 'up');
    this.moveUpdatedDownButton = moveColumnButton('Updated', 'down');
    this.moveDecidedByUpButton = moveColumnButton('Decided by', 'up');
    this.moveDecidedByDownButton = moveColumnButton('Decided by', 'down');

    this.resetToDefaultButton = this.dialog.getByRole('button', { name: 'Reset to default' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.saveColumnsButton = this.dialog.getByRole('button', { name: 'Save columns' });
  }
}
