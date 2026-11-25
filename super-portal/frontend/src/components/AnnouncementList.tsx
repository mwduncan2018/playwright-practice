import { Badge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router';

import { AUDIENCES, labelFor } from '../choices';
import { formatDate } from '../format';
import type { Announcement } from '../types';

/**
 * Announcements, pinned first, with their audience and whether they're scheduled. The list carries
 * the test ID it's given, and each announcement "announcement-item-<id>", with its parts inside.
 */
export function AnnouncementList({
  testId,
  announcements,
  label,
}: {
  testId: string;
  announcements: Announcement[];
  label: string;
}) {
  if (announcements.length === 0) {
    return (
      <p className="text-body-secondary" data-testid={`${testId}-empty-text`}>
        No announcements.
      </p>
    );
  }
  return (
    <ListGroup as="ul" aria-label={label} className="mb-2" data-testid={testId}>
      {announcements.map((announcement) => (
        <ListGroup.Item as="li" key={announcement.id} data-testid={`announcement-item-${announcement.id}`}>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link to={`/announcements/${announcement.id}`} className="fw-semibold" data-testid="announcement-link">
              {announcement.title}
            </Link>
            {announcement.pinned && (
              <Badge bg="warning" text="dark" data-testid="pinned-badge">
                Pinned
              </Badge>
            )}
            {announcement.audience !== 'Everyone' && (
              <Badge bg="secondary" data-testid="audience-badge">
                {labelFor(AUDIENCES, announcement.audience)}
              </Badge>
            )}
            {announcement.scheduled && (
              <Badge bg="info" text="dark" data-testid="scheduled-badge">
                Scheduled
              </Badge>
            )}
          </div>
          <div className="small text-body-secondary" data-testid="announcement-byline-text">
            {announcement.author_name} · {formatDate(announcement.publish_at)}
          </div>
          <p className="mb-0 small text-truncate" data-testid="announcement-summary-text">
            {announcement.body.split('\n')[0]}
          </p>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}
