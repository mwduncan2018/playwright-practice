import { Alert, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router';

import type { ApiError } from '../api';

export function Loading() {
  return (
    <div role="status" className="d-flex align-items-center gap-2 text-body-secondary my-3" data-testid="loading-status">
      <Spinner animation="border" size="sm" />
      <span>Loading…</span>
    </div>
  );
}

export function ErrorMessage({ error, onRetry }: { error: ApiError; onRetry?(): void }) {
  return (
    <Alert variant="danger" className="d-flex align-items-center justify-content-between gap-3" data-testid="load-error-alert">
      <span>{error.message}</span>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry} data-testid="load-error-retry-button">
          Try again
        </Button>
      )}
    </Alert>
  );
}

/** For a record that doesn't exist, or that this user isn't allowed to see. */
export function NotFoundMessage({ what, back, backLabel }: { what: string; back: string; backLabel: string }) {
  return (
    <>
      <h1 className="h3" data-testid="not-found-heading">
        Not found
      </h1>
      <Alert variant="warning" data-testid="not-found-alert">
        We couldn't find that {what}.
      </Alert>
      <Link to={back} data-testid="not-found-back-link">
        {backLabel}
      </Link>
    </>
  );
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: 'primary',
  Approved: 'success',
  Rejected: 'danger',
  Cancelled: 'secondary',
};

export function RequestStatusBadge({ status }: { status: string }) {
  return (
    <Badge bg={STATUS_COLORS[status] ?? 'secondary'} data-testid="request-status-badge">
      {status}
    </Badge>
  );
}

const PRIORITY_STYLES: Record<string, { bg: string; text?: 'dark' }> = {
  Low: { bg: 'light', text: 'dark' },
  Normal: { bg: 'info', text: 'dark' },
  High: { bg: 'warning', text: 'dark' },
  Urgent: { bg: 'danger' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const style = PRIORITY_STYLES[priority] ?? { bg: 'secondary' };
  return (
    <Badge
      bg={style.bg}
      text={style.text}
      className={priority === 'Low' ? 'border' : undefined}
      data-testid="request-priority-badge"
    >
      {priority}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return role === 'admin' ? (
    <Badge bg="info" text="dark" data-testid="role-badge">
      Admin
    </Badge>
  ) : (
    <Badge bg="secondary" data-testid="role-badge">
      Standard
    </Badge>
  );
}
