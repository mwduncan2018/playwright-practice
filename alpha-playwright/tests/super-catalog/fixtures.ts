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

function createCatalogPages(page: Page) {
  return {
    navbarPage: new NavbarPage(page),
    alertsPage: new AlertsPage(page),
    dashboardPage: new DashboardPage(page),
    productsPage: new ProductsPage(page),
    productFormPage: new ProductFormPage(page),
    productPage: new ProductPage(page),
    deleteProductDialog: new ConfirmDialog(page, 'Delete product'),
    categoriesPage: new CategoriesPage(page),
    newCategoryDialog: new CategoryDialog(page, 'New category'),
    editCategoryDialog: new CategoryDialog(page, /^Edit /),
    deleteCategoryDialog: new ConfirmDialog(page, 'Delete category'),
    activityLogPage: new ActivityLogPage(page),
    accessDeniedPage: new AccessDeniedPage(page),
  };
}

export const test = testWithUsers(createCatalogPages);

export { expect };

export const plan = testPlan('Super Catalog Manual Test Plan', '1.0');
