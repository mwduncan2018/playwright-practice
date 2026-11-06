import { Badge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router';

import { AUDIENCES, labelFor } from '../choices';
import { formatDate } from '../format';
import type { Announcement } from '../types';

/** Announcements, pinned first, with their audience and whether they're scheduled. */
export function AnnouncementList({ announcements, label }: { announcements: Announcement[]; label: string }) {
  if (announcements.length === 0) return <p className="text-body-secondary">No announcements.</p>;
  return (
    <ListGroup as="ul" aria-label={label} className="mb-2">
      {announcements.map((announcement) => (
        <ListGroup.Item as="li" key={announcement.id}>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link to={`/announcements/${announcement.id}`} className="fw-semibold">
              {announcement.title}
            </Link>
            {announcement.pinned && (
              <Badge bg="warning" text="dark">
                Pinned
              </Badge>
            )}
            {announcement.audience !== 'Everyone' && <Badge bg="secondary">{labelFor(AUDIENCES, announcement.audience)}</Badge>}
            {announcement.scheduled && (
              <Badge bg="info" text="dark">
                Scheduled
              </Badge>
            )}
          </div>
          <div className="small text-body-secondary">
            {announcement.author_name} · {formatDate(announcement.publish_at)}
          </div>
          <p className="mb-0 small text-truncate">{announcement.body.split('\n')[0]}</p>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
