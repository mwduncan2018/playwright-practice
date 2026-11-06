import { useState } from 'react';
import { Badge, Breadcrumb, Button, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { useAuth } from '../auth';
import { AUDIENCES, labelFor } from '../choices';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorMessage, Loading, NotFoundMessage } from '../components/Feedback';
import { useToast } from '../components/Toasts';
import { formatDateTime } from '../format';
import type { Announcement } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function AnnouncementDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const api = useApi();
  const notify = useToast();
  const navigate = useNavigate();
  const loaded = useLoad<Announcement>(`/api/announcements/${id}`);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  usePageTitle(loaded.data?.title ?? 'Announcement');

  if (loaded.error?.status === 404) {
    return <NotFoundMessage what="announcement" back="/announcements" backLabel="Back to announcements" />;
  }
  const announcement = loaded.data;
  if (!announcement) return loaded.error ? <ErrorMessage error={loaded.error} onRetry={loaded.reload} /> : <Loading />;

  async function remove() {
    if (!announcement) return;
    setDeleting(true);
    try {
      await api(`/api/announcements/${announcement.id}`, { method: 'DELETE' });
      notify('Deleted the announcement.');
      navigate('/announcements');
    } catch (failure) {
      setDeleteError(asApiError(failure).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/announcements' }}>
          Announcements
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{announcement.title}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">{announcement.title}</h1>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            {announcement.pinned && (
              <Badge bg="warning" text="dark">
                Pinned
              </Badge>
            )}
            <Badge bg="secondary" data-testid="announcement-audience">
              {labelFor(AUDIENCES, announcement.audience)}
            </Badge>
            {announcement.scheduled && (
              <Badge bg="info" text="dark">
                Scheduled
              </Badge>
            )}
          </div>
        </div>
        {user.isAdmin && (
          <Button
            variant="outline-danger"
            onClick={() => {
              setDeleteError(undefined);
              setConfirmOpen(true);
            }}
          >
            Delete
          </Button>
        )}
      </div>
      <Card style={{ maxWidth: 800 }}>
        <Card.Body>
          <p className="small text-body-secondary" data-testid="announcement-meta">
            {announcement.scheduled ? 'Scheduled for' : 'Posted'} {formatDateTime(announcement.publish_at)} by{' '}
            {announcement.author_name}
          </p>
          {announcement.body.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </Card.Body>
      </Card>
      <ConfirmDialog
        show={confirmOpen}
        title="Delete announcement"
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      >
        Delete <strong>{announcement.title}</strong>? This can't be undone.
      </ConfirmDialog>
    </>
  );
}
