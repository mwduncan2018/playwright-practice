import { Route, Routes } from 'react-router';

import { Layout } from './components/Layout';
import { RequireAdmin } from './components/RequireAdmin';
import AnnouncementDetailsPage from './pages/AnnouncementDetailsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import CatalogPage from './pages/CatalogPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PeoplePage from './pages/PeoplePage';
import PersonPage from './pages/PersonPage';
import ReportsPage from './pages/ReportsPage';
import RequestDetailsPage from './pages/RequestDetailsPage';
import { AllRequestsPage, MyRequestsPage } from './pages/RequestsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="requests/:number" element={<RequestDetailsPage />} />
        <Route path="approvals" element={<RequireAdmin><ApprovalsPage /></RequireAdmin>} />
        <Route path="all-requests" element={<RequireAdmin><AllRequestsPage /></RequireAdmin>} />
        <Route path="reports" element={<RequireAdmin><ReportsPage /></RequireAdmin>} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailsPage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="people/:username" element={<PersonPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
