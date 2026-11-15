/**
 * Super Catalog's tests import test and expect from here. Each user a test asks for, such as standard
 * or admin, has a browser of their own and every Super Catalog page object on it:
 * admin.products.newProduct. Dialogs sit beside the pages, never inside one:
 * admin.deleteProductDialog.confirmButton.
 */
import type { Page } from '@playwright/test';

import { expect, testWithUsers } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AccessDeniedPage } from './pages/access-denied.page';
import { ActivityLogPage } from './pages/activity-log.page';
import { AlertsPage } from './pages/alerts.page';
import { CategoriesPage } from './pages/categories.page';
import { CategoryDialog } from './pages/category.dialog';
import { ConfirmDialog } from './pages/confirm.dialog';
import { DashboardPage } from './pages/dashboard.page';
import { NavbarPage } from './pages/navbar.page';
import { ProductFormPage } from './pages/product-form.page';
import { ProductPage } from './pages/product.page';
import { ProductsPage } from './pages/products.page';

function catalogPages(page: Page) {
  return {
    navbar: new NavbarPage(page),
    alerts: new AlertsPage(page),
    dashboard: new DashboardPage(page),
    products: new ProductsPage(page),
    productForm: new ProductFormPage(page),
    product: new ProductPage(page),
    deleteProductDialog: new ConfirmDialog(page, 'Delete product'),
    categories: new CategoriesPage(page),
    newCategoryDialog: new CategoryDialog(page, 'New category'),
    editCategoryDialog: new CategoryDialog(page, /^Edit /),
    deleteCategoryDialog: new ConfirmDialog(page, 'Delete category'),
    activityLog: new ActivityLogPage(page),
    accessDenied: new AccessDeniedPage(page),
  };
}

export const test = testWithUsers(catalogPages);

export { expect };

/** The manual test plan these tests follow: tests/super-catalog/super-catalog-test-plan.docx */
export const plan = testPlan('Super Catalog Manual Test Plan', '1.0');
