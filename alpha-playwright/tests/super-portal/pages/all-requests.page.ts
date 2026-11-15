import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class AllRequestsPage extends BasePage {
  readonly path = '/all-requests';
  readonly searchInput: Locator;
  readonly statusSelect: Locator;
  readonly typeSelect: Locator;
  readonly prioritySelect: Locator;
  readonly requesterSelect: Locator;
  readonly clearFiltersButton: Locator;
  readonly summaryText: Locator;
  readonly columnsButton: Locator;
  readonly allRequestsTable: Locator;
  readonly columnHeaders: Locator;
  readonly requestRows: Locator;
  readonly pagination: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    const filterForm = page.getByRole('search', { name: 'Filter requests' });
    this.searchInput = filterForm.getByLabel('Search');
    this.statusSelect = filterForm.getByLabel('Status');
    this.typeSelect = filterForm.getByLabel('Type');
    this.prioritySelect = filterForm.getByLabel('Priority');
    this.requesterSelect = filterForm.getByLabel('Requester');
    this.clearFiltersButton = filterForm.getByRole('button', { name: 'Clear filters' });
    this.summaryText = page.getByRole('status').filter({ hasText: /^(Showing|No requests)/ });
    this.columnsButton = page.getByRole('button', { name: 'Columns', exact: true });
    this.allRequestsTable = page.getByRole('table', { name: 'All requests' });
    this.columnHeaders = this.allRequestsTable.getByRole('columnheader');
    this.requestRows = this.allRequestsTable.getByRole('row').filter({ has: page.getByRole('cell') });
    this.pagination = page.getByRole('navigation', { name: 'All requests pages' });
    this.nextPageButton = this.pagination.getByRole('button', { name: 'Next' });
  }

  requestRow(requestNumber: string, requesterName: string): Locator {
    return this.requestRows
      .filter({
        has: this.cellInColumn('Number').and(this.page.getByRole('cell', { name: requestNumber, exact: true })),
      })
      .filter({
        has: this.cellInColumn('Requester').and(this.page.getByRole('cell', { name: requesterName, exact: true })),
      });
  }

  requestNumberLink(requestNumber: string): Locator {
    return this.allRequestsTable.getByRole('link', { name: requestNumber, exact: true });
  }

  titleCell(requestNumber: string, requesterName: string): Locator {
    return this.requestRow(requestNumber, requesterName).locator(this.cellInColumn('Title'));
  }

  statusCell(requestNumber: string, requesterName: string): Locator {
    return this.requestRow(requestNumber, requesterName).locator(this.cellInColumn('Status'));
  }

  decidedByCell(requestNumber: string, requesterName: string): Locator {
    return this.requestRow(requestNumber, requesterName).locator(this.cellInColumn('Decided by'));
  }

  currentPageNumber(pageNumber: number): Locator {
    return this.pagination.getByText(`${pageNumber}(current)`);
  }

  private cellInColumn(columnName: string): Locator {
    const columnHeader = `ancestor::table[1]/thead/tr/th[normalize-space(.)="${columnName}"]`;
    return this.page.locator(`xpath=td[count(${columnHeader}/preceding-sibling::th) + 1][${columnHeader}]`);
  }
}
