import type { Download, Locator, Page } from '@playwright/test';

export class ProductsPage {
  readonly heading: Locator;
  readonly newProduct: Locator;
  readonly exportCsv: Locator;
  readonly search: Locator;
  readonly category: Locator;
  readonly supplier: Locator;
  readonly status: Locator;
  readonly minPrice: Locator;
  readonly maxPrice: Locator;
  readonly lowStockOnly: Locator;
  readonly clearFilters: Locator;
  /** "Showing 1–10 of 60 products", or "No products match these filters." */
  readonly summary: Locator;
  readonly table: Locator;
  /** The table's product rows, not its heading row. */
  readonly rows: Locator;
  /** The product names, in table order. */
  readonly productNames: Locator;
  /** Product rows without a Low badge. */
  readonly rowsWithoutLowBadge: Locator;
  readonly rowsPerPage: Locator;
  readonly pagination: Locator;
  readonly nextPage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Products', level: 1 });
    this.newProduct = page.getByRole('link', { name: 'New product' });
    this.exportCsv = page.getByRole('button', { name: 'Export CSV' });
    const filters = page.getByRole('search', { name: 'Filter products' });
    this.search = filters.getByLabel('Search');
    this.category = filters.getByLabel('Category');
    this.supplier = filters.getByLabel('Supplier');
    this.status = filters.getByLabel('Status');
    this.minPrice = filters.getByLabel('Min price');
    this.maxPrice = filters.getByLabel('Max price');
    this.lowStockOnly = filters.getByLabel('Low stock only');
    this.clearFilters = filters.getByRole('button', { name: 'Clear filters' });
    this.summary = page.getByRole('status').filter({ hasText: /^(Showing|No products)/ });
    this.table = page.getByRole('table', { name: 'Products' });
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    this.productNames = this.table.getByRole('link');
    this.rowsWithoutLowBadge = this.rows.filter({ hasNot: page.getByText('Low', { exact: true }) });
    this.rowsPerPage = page.getByLabel('Rows per page');
    this.pagination = page.getByRole('navigation', { name: 'Product pages' });
    this.nextPage = this.pagination.getByRole('button', { name: 'Next' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  /** A product's row. Rows carry test IDs with their SKU, such as product-row-ELE-1001. */
  row(sku: string): Locator {
    return this.page.getByTestId(`product-row-${sku}`);
  }

  productLink(name: string): Locator {
    return this.table.getByRole('link', { name, exact: true });
  }

  /** A column heading. Its aria-sort says which way the column is sorted. */
  columnHeader(name: string): Locator {
    return this.table.getByRole('columnheader', { name });
  }

  async sortBy(column: string): Promise<void> {
    await this.columnHeader(column).getByRole('button').click();
  }

  /** React Bootstrap marks the current page with hidden "(current)" text after its number. */
  currentPage(page: number): Locator {
    return this.pagination.getByText(`${page}(current)`);
  }

  async exportToCsv(): Promise<Download> {
    const download = this.page.waitForEvent('download');
    await this.exportCsv.click();
    return download;
  }
}
