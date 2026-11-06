import { Alert, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router';

import type { ApiError } from '../api';

export function Loading() {
  return (
    <div role="status" className="d-flex align-items-center gap-2 text-body-secondary my-3">
      <Spinner animation="border" size="sm" />
      <span>Loading…</span>
    </div>
  );
}

export function ErrorMessage({ error, onRetry }: { error: ApiError; onRetry?(): void }) {
  return (
    <Alert variant="danger" className="d-flex align-items-center justify-content-between gap-3">
      <span>{error.message}</span>
      {onRetry && (
        <Button variant="outline-danger" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}

/** For a record that doesn't exist, usually because it was deleted. */
export function NotFoundMessage({ what, back, backLabel }: { what: string; back: string; backLabel: string }) {
  return (
    <>
      <h1 className="h3">Not found</h1>
      <Alert variant="warning">We couldn't find that {what}. It may have been deleted.</Alert>
      <Link to={back}>{backLabel}</Link>
    </>
  );
}

const STATUS_COLORS: Record<string, string> = { Active: 'success', Draft: 'secondary', Discontinued: 'dark' };

export function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? 'secondary';
  // The near-black Discontinued badge needs an edge to stand out on the dark page.
  return (
    <Badge bg={color} className={color === 'dark' ? 'border' : undefined}>
      {status}
    </Badge>
  );
}
