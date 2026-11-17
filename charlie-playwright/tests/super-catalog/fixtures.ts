import type { Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

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
import { newTestProduct, type TestProduct } from './test-data';

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

export const plan = testPlan('Super Catalog Manual Test Plan', '1.1');

export const test = testWithUsers(createCatalogPages).extend<{ testProduct: TestProduct; testPlanAnnotation: void }>({
  testProduct: async ({}, use) => {
    await use(newTestProduct());
  },

  testPlanAnnotation: [
    async ({}, use, testInfo) => {
      const caseTag = testInfo.tags.find((tag) => /^@SC-\d{3}$/.test(tag));
      if (caseTag) testInfo.annotations.push(plan(caseTag.slice(1)));
      await use();
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);

export { expect };
