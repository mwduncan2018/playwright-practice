import type { Locator, Page } from '@playwright/test';

import { BasePage } from '../../../shared/base.page';

export class ProductsPage extends BasePage {
  readonly path = '/products';
  readonly heading: Locator;
  readonly newProductLink: Locator;
  readonly exportCsvButton: Locator;
  readonly searchInput: Locator;
  readonly categorySelect: Locator;
  readonly supplierSelect: Locator;
  readonly statusSelect: Locator;
  readonly minPriceInput: Locator;
  readonly maxPriceInput: Locator;
  readonly lowStockOnlyCheckbox: Locator;
  readonly clearFiltersButton: Locator;
  readonly summaryText: Locator;
  readonly productsTable: Locator;
  readonly productRows: Locator;
  readonly firstProductRow: Locator;
  readonly productNameLinks: Locator;
  readonly adjustableDumbbellsLink: Locator;
  readonly productRowsWithoutLowBadge: Locator;
  readonly rowsPerPageSelect: Locator;
  readonly pagination: Locator;
  readonly nextPageButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Products', level: 1 });
    this.newProductLink = page.getByRole('link', { name: 'New product' });
    this.exportCsvButton = page.getByRole('button', { name: 'Export CSV' });
    const filterForm = page.getByRole('search', { name: 'Filter products' });
    this.searchInput = filterForm.getByLabel('Search');
    this.categorySelect = filterForm.getByLabel('Category');
    this.supplierSelect = filterForm.getByLabel('Supplier');
    this.statusSelect = filterForm.getByLabel('Status');
    this.minPriceInput = filterForm.getByLabel('Min price');
    this.maxPriceInput = filterForm.getByLabel('Max price');
    this.lowStockOnlyCheckbox = filterForm.getByLabel('Low stock only');
    this.clearFiltersButton = filterForm.getByRole('button', { name: 'Clear filters' });
    this.summaryText = page.getByRole('status').filter({ hasText: /^(Showing|No products)/ });
    this.productsTable = page.getByRole('table', { name: 'Products' });
    this.productRows = this.productsTable.getByRole('row').filter({ has: page.getByRole('cell') });
    this.firstProductRow = this.productRows.first();
    this.productNameLinks = this.productsTable.getByRole('link');
    this.adjustableDumbbellsLink = this.productsTable.getByRole('link', { name: 'Adjustable Dumbbells', exact: true });
    this.productRowsWithoutLowBadge = this.productRows.filter({ hasNot: page.getByText('Low', { exact: true }) });
    this.rowsPerPageSelect = page.getByLabel('Rows per page');
    this.pagination = page.getByRole('navigation', { name: 'Product pages' });
    this.nextPageButton = this.pagination.getByRole('button', { name: 'Next' });
  }

  productRow(sku: string): Locator {
    return this.page.getByTestId(`product-row-${sku}`);
  }

  columnHeader(name: string): Locator {
    return this.productsTable.getByRole('columnheader', { name });
  }

  async sortBy(column: string): Promise<void> {
    await this.columnHeader(column).getByRole('button').click();
  }

  currentPageNumber(page: number): Locator {
    return this.pagination.getByText(`${page}(current)`);
  }
}
