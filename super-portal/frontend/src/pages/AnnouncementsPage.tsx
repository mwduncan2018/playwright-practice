import { useState } from 'react';
import { Button } from 'react-bootstrap';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { AnnouncementList } from '../components/AnnouncementList';
import { AnnouncementWizard } from '../components/AnnouncementWizard';
import { ErrorMessage, Loading } from '../components/Feedback';
import { plural } from '../format';
import type { Announcement } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function AnnouncementsPage() {
  usePageTitle('Announcements');
  const { user } = useAuth();
  const { data, error, loading, reload } = useLoad<Announcement[]>('/api/announcements');
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Announcements</h1>
        {user.isAdmin && <Button onClick={() => setWizardOpen(true)}>New announcement</Button>}
      </div>
      <p role="status" className="text-body-secondary mb-2">
        {data && plural(data.length, 'announcement')}
      </p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && <AnnouncementList announcements={data} label="Announcements" />}
      {user.isAdmin && (
        <AnnouncementWizard show={wizardOpen} onClose={() => setWizardOpen(false)} onCreated={reload} />
      )}
    </>
  );
}
