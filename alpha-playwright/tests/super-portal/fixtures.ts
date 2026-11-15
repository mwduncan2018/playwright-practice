/**
 * Super Portal's tests import test and expect from here. Each user a test asks for, such as standard
 * or admin, has a browser of their own and every Super Portal page object on it:
 * standard.request.status. Wizards and dialogs sit beside the pages, never inside one:
 * admin.rejectDialog.confirmButton.
 */
import type { Page } from '@playwright/test';

import { expect, testWithUsers } from '../../shared/fixtures';
import { testPlan } from '../../shared/test-plan';
import { AnnouncementWizard } from './pages/announcement-wizard';
import { AnnouncementPage, AnnouncementsPage } from './pages/announcements.page';
import { ApprovalsPage } from './pages/approvals.page';
import { ConfirmDialog, DecisionDialog } from './pages/dialogs';
import { HomePage } from './pages/home.page';
import { PortalLayout } from './pages/layout';
import { MyRequestsPage } from './pages/my-requests.page';
import { NewRequestPage } from './pages/new-request.page';
import { RequestWizard } from './pages/request-wizard';
import { RequestPage } from './pages/request.page';
import { SettingsPage } from './pages/settings.page';

function portalPages(page: Page) {
  return {
    layout: new PortalLayout(page),
    home: new HomePage(page),
    newRequest: new NewRequestPage(page),
    equipmentWizard: new RequestWizard(page, 'Request equipment'),
    softwareWizard: new RequestWizard(page, 'Request software'),
    accessWizard: new RequestWizard(page, 'Request access'),
    myRequests: new MyRequestsPage(page),
    request: new RequestPage(page),
    cancelRequestDialog: new ConfirmDialog(page, 'Cancel request', {
      confirm: 'Cancel request',
      dismiss: 'Keep request',
    }),
    approvals: new ApprovalsPage(page),
    approveDialog: new DecisionDialog(page, 'Approve'),
    rejectDialog: new DecisionDialog(page, 'Reject'),
    announcements: new AnnouncementsPage(page),
    announcementWizard: new AnnouncementWizard(page),
    announcement: new AnnouncementPage(page),
    deleteAnnouncementDialog: new ConfirmDialog(page, 'Delete announcement'),
    settings: new SettingsPage(page),
  };
}

export const test = testWithUsers(portalPages);

export { expect };

/** The manual test plan these tests follow: tests/super-portal/super-portal-test-plan.docx */
export const plan = testPlan('Super Portal Manual Test Plan', '1.0');
