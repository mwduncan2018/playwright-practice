import type { Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

import { expect, testWithUsers } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AccessDeniedPage } from './pages/access-denied.page';
import { AlertsPage } from './pages/alerts.page';
import { AllRequestsPage } from './pages/all-requests.page';
import { AnnouncementPage } from './pages/announcement.page';
import { AnnouncementWizard } from './pages/announcement.wizard';
import { AnnouncementsPage } from './pages/announcements.page';
import { ApprovalsPage } from './pages/approvals.page';
import { ColumnsDialog } from './pages/columns.dialog';
import { ConfirmDialog } from './pages/confirm.dialog';
import { DecisionDialog } from './pages/decision.dialog';
import { HomePage } from './pages/home.page';
import { MyRequestsPage } from './pages/my-requests.page';
import { NavbarPage } from './pages/navbar.page';
import { NewRequestPage } from './pages/new-request.page';
import { RequestPage } from './pages/request.page';
import { RequestWizard } from './pages/request.wizard';
import { SettingsPage } from './pages/settings.page';
import { newTestAnnouncement, type TestAnnouncement } from './test-data';

function createPortalPages(page: Page) {
  return {
    navbarPage: new NavbarPage(page),
    alertsPage: new AlertsPage(page),
    homePage: new HomePage(page),
    newRequestPage: new NewRequestPage(page),
    equipmentWizard: new RequestWizard(page, 'Request equipment'),
    softwareWizard: new RequestWizard(page, 'Request software'),
    accessWizard: new RequestWizard(page, 'Request access'),
    requestWizard: new RequestWizard(page, /^Request (equipment|software|access)$/),
    myRequestsPage: new MyRequestsPage(page),
    requestPage: new RequestPage(page),
    cancelRequestDialog: new ConfirmDialog(page, 'Cancel request', {
      confirm: 'Cancel request',
      dismiss: 'Keep request',
    }),
    approvalsPage: new ApprovalsPage(page),
    approveDialog: new DecisionDialog(page, 'Approve'),
    rejectDialog: new DecisionDialog(page, 'Reject'),
    allRequestsPage: new AllRequestsPage(page),
    columnsDialog: new ColumnsDialog(page),
    announcementsPage: new AnnouncementsPage(page),
    announcementWizard: new AnnouncementWizard(page),
    announcementPage: new AnnouncementPage(page),
    deleteAnnouncementDialog: new ConfirmDialog(page, 'Delete announcement'),
    settingsPage: new SettingsPage(page),
    accessDeniedPage: new AccessDeniedPage(page),
  };
}

interface PortalScenarioContext {
  requestNumber: string;
}

const plan = testPlan('Super Portal Manual Test Plan', '1.4');

export const test = testWithUsers(createPortalPages).extend<{
  testAnnouncement: TestAnnouncement;
  scenarioContext: PortalScenarioContext;
  testPlanAnnotation: void;
}>({
  testAnnouncement: async ({}, use) => {
    await use(newTestAnnouncement());
  },

  scenarioContext: async ({}, use) => {
    await use({} as PortalScenarioContext);
  },

  testPlanAnnotation: [
    async ({}, use, testInfo) => {
      const caseTag = testInfo.tags.find((tag) => /^@SP-\d{3}$/.test(tag));
      if (caseTag) testInfo.annotations.push(plan(caseTag.slice(1)));
      await use();
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);

export { expect };
