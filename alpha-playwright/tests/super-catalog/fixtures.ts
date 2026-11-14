/**
 * Super Catalog's tests import test and expect from here. Each user a test asks for, such as standard
 * or admin, has a browser of their own and every Super Catalog page object on it:
 * admin.products.newProduct.
 */
import type { Page } from '@playwright/test';

import { expect, testWithUsers } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AccessDeniedPage } from './pages/access-denied.page';
import { ActivityLogPage } from './pages/activity-log.page';
import { CategoriesPage } from './pages/categories.page';
import { DashboardPage } from './pages/dashboard.page';
import { CatalogLayout } from './pages/layout';
import { ProductFormPage } from './pages/product-form.page';
import { ProductPage } from './pages/product.page';
import { ProductsPage } from './pages/products.page';

function catalogPages(page: Page) {
  return {
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

export const test = testWithUsers(catalogPages);

export { expect };

/** The manual test plan these tests follow: tests/super-catalog/super-catalog-test-plan.docx */
export const plan = testPlan('Super Catalog Manual Test Plan', '1.0');
