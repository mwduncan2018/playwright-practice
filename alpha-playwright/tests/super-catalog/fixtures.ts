/**
 * Super Catalog's tests import test and expect from here. The catalog fixture holds the test's page
 * and every page object on it.
 */
import type { Page } from '@playwright/test';

import { expect, test as base } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AccessDeniedPage } from './pages/access-denied.page';
import { ActivityLogPage } from './pages/activity-log.page';
import { CategoriesPage } from './pages/categories.page';
import { DashboardPage } from './pages/dashboard.page';
import { CatalogLayout } from './pages/layout';
import { ProductFormPage } from './pages/product-form.page';
import { ProductPage } from './pages/product.page';
import { ProductsPage } from './pages/products.page';

export function catalogPages(page: Page) {
  return {
    page,
    layout: new CatalogLayout(page),
    dashboard: new DashboardPage(page),
    products: new ProductsPage(page),
    productForm: new ProductFormPage(page),
    product: new ProductPage(page),
    categories: new CategoriesPage(page),
    activityLog: new ActivityLogPage(page),
    accessDenied: new AccessDeniedPage(page),
  };
}

export type CatalogPages = ReturnType<typeof catalogPages>;

export const test = base.extend<{ catalog: CatalogPages }>({
  catalog: async ({ page }, use) => {
    await use(catalogPages(page));
  },
});

export { expect };

/** The manual test plan these tests follow: tests/super-catalog/super-catalog-test-plan.docx */
export const plan = testPlan('Super Catalog Manual Test Plan', '1.0');
