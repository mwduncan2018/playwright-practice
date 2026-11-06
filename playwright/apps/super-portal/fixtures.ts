/**
 * Super Portal's tests import test and expect from here. The portal fixture holds every page
 * object for the test's page; openPortalAs gives a second person their own browser and pages.
 */
import type { Page } from '@playwright/test';

import type { Role } from '../../shared/accounts';
import { expect, test as base } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AnnouncementPage, AnnouncementsPage } from './pages/announcements.page';
import { ApprovalsPage } from './pages/approvals.page';
import { HomePage } from './pages/home.page';
import { PortalLayout } from './pages/layout';
import { MyRequestsPage } from './pages/my-requests.page';
import { NewRequestPage } from './pages/new-request.page';
import { RequestWizard } from './pages/request-wizard';
import { RequestPage } from './pages/request.page';
import { SettingsPage } from './pages/settings.page';

export function portalPages(page: Page) {
  return {
    layout: new PortalLayout(page),
    home: new HomePage(page),
    newRequest: new NewRequestPage(page),
    equipmentWizard: new RequestWizard(page, 'Request equipment'),
    softwareWizard: new RequestWizard(page, 'Request software'),
    accessWizard: new RequestWizard(page, 'Request access'),
    myRequests: new MyRequestsPage(page),
    request: new RequestPage(page),
    approvals: new ApprovalsPage(page),
    announcements: new AnnouncementsPage(page),
    announcement: new AnnouncementPage(page),
    settings: new SettingsPage(page),
  };
}

export type PortalPages = ReturnType<typeof portalPages>;

interface PortalFixtures {
  portal: PortalPages;
  /** Super Portal for a second person, signed in as another role in a browser of their own. */
  openPortalAs: (role: Role) => Promise<PortalPages>;
}

export const test = base.extend<PortalFixtures>({
  portal: async ({ page }, use) => {
    await use(portalPages(page));
  },
  openPortalAs: async ({ openPageAs }, use) => {
    await use(async (role) => portalPages(await openPageAs(role)));
  },
});

export { expect };

/** The manual test plan these tests follow: apps/super-portal/super-portal-test-plan.docx */
export const plan = testPlan('Super Portal Manual Test Plan', '1.0');
