/**
 * Super Portal's tests import test and expect from here. Each user a test asks for, such as
 * standardUser or adminUser, has a browser of their own and every Super Portal page object on it:
 * standardUser.requestPage.statusValue. Wizards and dialogs sit beside the pages, never inside one:
 * adminUser.rejectDialog.confirmButton.
 */
import type { Page } from '@playwright/test';

import { expect, testWithUsers } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AlertsPage } from './pages/alerts.page';
import { AnnouncementPage } from './pages/announcement.page';
import { AnnouncementWizard } from './pages/announcement.wizard';
import { AnnouncementsPage } from './pages/announcements.page';
import { ApprovalsPage } from './pages/approvals.page';
import { ConfirmDialog } from './pages/confirm.dialog';
import { DecisionDialog } from './pages/decision.dialog';
import { HomePage } from './pages/home.page';
import { MyRequestsPage } from './pages/my-requests.page';
import { NavbarPage } from './pages/navbar.page';
import { NewRequestPage } from './pages/new-request.page';
import { RequestPage } from './pages/request.page';
import { RequestWizard } from './pages/request.wizard';
import { SettingsPage } from './pages/settings.page';

function createPortalPages(page: Page) {
  return {
    navbarPage: new NavbarPage(page),
    alertsPage: new AlertsPage(page),
    homePage: new HomePage(page),
    newRequestPage: new NewRequestPage(page),
    equipmentWizard: new RequestWizard(page, 'Request equipment'),
    softwareWizard: new RequestWizard(page, 'Request software'),
    accessWizard: new RequestWizard(page, 'Request access'),
    myRequestsPage: new MyRequestsPage(page),
    requestPage: new RequestPage(page),
    cancelRequestDialog: new ConfirmDialog(page, 'Cancel request', {
      confirm: 'Cancel request',
      dismiss: 'Keep request',
    }),
    approvalsPage: new ApprovalsPage(page),
    approveDialog: new DecisionDialog(page, 'Approve'),
    rejectDialog: new DecisionDialog(page, 'Reject'),
    announcementsPage: new AnnouncementsPage(page),
    announcementWizard: new AnnouncementWizard(page),
    announcementPage: new AnnouncementPage(page),
    deleteAnnouncementDialog: new ConfirmDialog(page, 'Delete announcement'),
    settingsPage: new SettingsPage(page),
  };
}

export const test = testWithUsers(createPortalPages);

export { expect };

/** The manual test plan these tests follow: tests/super-portal/super-portal-test-plan.docx */
export const plan = testPlan('Super Portal Manual Test Plan', '1.0');
