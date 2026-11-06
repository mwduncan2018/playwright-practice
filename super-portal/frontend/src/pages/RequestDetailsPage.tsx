import { type FormEvent, useState } from 'react';
import { Alert, Breadcrumb, Button, Card, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { useAuth } from '../auth';
import { DELIVERY_METHODS, labelFor } from '../choices';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DecisionDialog } from '../components/DecisionDialog';
import { Detail } from '../components/Detail';
import { ErrorMessage, Loading, NotFoundMessage, PriorityBadge, RequestStatusBadge } from '../components/Feedback';
import { Field } from '../components/Field';
import { useToast } from '../components/Toasts';
import { formatDateTime } from '../format';
import type { RequestDetail } from '../types';
import { usePageTitle } from '../usePageTitle';

type DetailRow = [label: string, testId: string, value: string];

/** The request's own fields, which depend on its type. */
function detailRows(request: RequestDetail): DetailRow[] {
  const details = request.details;
  const text = (key: string) => String(details[key] ?? '');
  if (request.type === 'Equipment') {
    const rows: DetailRow[] = [
      ['Item', 'request-detail-item', text('item')],
      ['Quantity', 'request-detail-quantity', text('quantity')],
      ['Delivery', 'request-detail-delivery', labelFor(DELIVERY_METHODS, text('delivery'))],
    ];
    if (details.delivery === 'Ship') rows.push(['Address', 'request-detail-address', text('address')]);
    return rows;
  }
  if (request.type === 'Software') {
    return [
      ['Software', 'request-detail-software', text('software')],
      ['License length', 'request-detail-license', text('license')],
      ['Seats', 'request-detail-seats', text('seats')],
    ];
  }
  const rows: DetailRow[] = [
    ['System', 'request-detail-system', text('system')],
    ['Access level', 'request-detail-level', text('level')],
  ];
  if (details.level === 'Administrator') {
    rows.push(
      ['Reason for administrator access', 'request-detail-security-reason', text('security_justification')],
      ['Security training', 'request-detail-training', details.training_completed ? 'Completed' : 'Not completed'],
    );
  }
  return rows;
}

function DecisionSummary({ request }: { request: RequestDetail }) {
  if (request.status === 'Approved' || request.status === 'Rejected') {
    const approved = request.status === 'Approved';
    return (
      <Alert variant={approved ? 'success' : 'danger'} data-testid="request-decision">
        <strong>{request.status}</strong> by {request.decided_by} on {formatDateTime(request.decided_at ?? request.updated_at)}.
        {request.decision_note && (
          <div className="mt-1">
            {approved ? 'Note' : 'Reason'}: {request.decision_note}
          </div>
        )}
      </Alert>
    );
  }
  if (request.status === 'Cancelled') {
    const cancelled = request.events.find((event) => event.kind === 'Cancelled');
    return (
      <Alert variant="secondary" data-testid="request-decision">
        <strong>Cancelled</strong> by {request.requester_name} on {formatDateTime(cancelled?.at ?? request.updated_at)}.
      </Alert>
    );
  }
  return null;
}

export default function RequestDetailsPage() {
  const { number = '' } = useParams();
  const { user } = useAuth();
  const api = useApi();
  const notify = useToast();
  const loaded = useLoad<RequestDetail>(`/api/requests/${number}`);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string>();
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');
  usePageTitle(loaded.data ? `${loaded.data.number} ${loaded.data.title}` : 'Request');

  if (loaded.error?.status === 404) {
    return <NotFoundMessage what="request" back="/requests" backLabel="Back to my requests" />;
  }
  const request = loaded.data;
  if (!request) return loaded.error ? <ErrorMessage error={loaded.error} onRetry={loaded.reload} /> : <Loading />;
  const own = request.requester_username === user.username;

  async function cancel() {
    if (!request) return;
    setCancelling(true);
    try {
      await api(`/api/requests/${request.number}/cancel`, { method: 'POST' });
      notify(`Cancelled ${request.number}.`);
      setCancelOpen(false);
      loaded.reload();
    } catch (failure) {
      setCancelError(asApiError(failure).message);
    } finally {
      setCancelling(false);
    }
  }

  function decide(which: 'approve' | 'reject') {
    setDecision(which);
    setDecisionOpen(true);
  }

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: own ? '/requests' : '/all-requests' }}>
          {own ? 'My requests' : 'All requests'}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{request.number}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">
            {request.number} {request.title}
          </h1>
          <div className="d-flex gap-2">
            <RequestStatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
        </div>
        <div className="d-flex gap-2">
          {request.can_decide && (
            <>
              <Button variant="success" onClick={() => decide('approve')}>
                Approve
              </Button>
              <Button variant="outline-danger" onClick={() => decide('reject')}>
                Reject
              </Button>
            </>
          )}
          {request.can_cancel && (
            <Button
              variant="outline-danger"
              onClick={() => {
                setCancelError(undefined);
                setCancelOpen(true);
              }}
            >
              Cancel request
            </Button>
          )}
        </div>
      </div>
      {request.decide_blocked_reason && (
        <Alert variant="info">{request.decide_blocked_reason} Another admin will decide on it.</Alert>
      )}
      <DecisionSummary request={request} />

      <Row className="g-4">
        <Col lg={7}>
          <Card className="mb-4">
            <Card.Header as="h2" className="h6 py-3 mb-0">
              Request
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <Detail label="Type" testId="request-type">
                  {request.type}
                </Detail>
                <Detail label="Requested by" testId="request-requester">
                  {request.requester_name}
                </Detail>
                <Detail label="Submitted" testId="request-submitted">
                  {formatDateTime(request.created_at)}
                </Detail>
                <Detail label="Status" testId="request-status">
                  {request.status}
                </Detail>
                <Detail label="Priority" testId="request-priority">
                  {request.priority}
                </Detail>
                <Detail label="Needed by" testId="request-needed-by">
                  {request.needed_by ?? 'No date'}
                </Detail>
                <Detail label="Reason" testId="request-reason">
                  {request.justification}
                </Detail>
              </dl>
            </Card.Body>
          </Card>
          <Card>
            <Card.Header as="h2" className="h6 py-3 mb-0">
              {request.type} details
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                {detailRows(request).map(([label, testId, value]) => (
                  <Detail key={testId} label={label} testId={testId}>
                    {value}
                  </Detail>
                ))}
              </dl>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={5}>
          <h2 className="h5">History</h2>
          <ListGroup as="ol" aria-label="History" className="mb-3">
            {request.events.map((event, index) => (
              <ListGroup.Item as="li" key={index}>
                <div className="d-flex justify-content-between gap-2">
                  <strong>{event.kind}</strong>
                  <span className="small text-body-secondary text-nowrap">{formatDateTime(event.at)}</span>
                </div>
                <div className="small text-body-secondary">{event.name}</div>
                {event.text && <p className="mb-0 mt-1">{event.text}</p>}
              </ListGroup.Item>
            ))}
          </ListGroup>
          <CommentForm
            number={request.number}
            onPosted={() => {
              notify('Comment posted.');
              loaded.reload();
            }}
          />
        </Col>
      </Row>

      <ConfirmDialog
        show={cancelOpen}
        title="Cancel request"
        confirmLabel="Cancel request"
        dismissLabel="Keep request"
        busy={cancelling}
        error={cancelError}
        onConfirm={cancel}
        onClose={() => setCancelOpen(false)}
      >
        Cancel <strong>{request.number}</strong>? An admin won't be able to approve it after that.
      </ConfirmDialog>
      <DecisionDialog
        show={decisionOpen}
        request={request}
        decision={decision}
        onClose={() => setDecisionOpen(false)}
        onDecided={(updated) => {
          notify(`${updated.status} ${updated.number}.`);
          setDecisionOpen(false);
          loaded.reload();
        }}
      />
    </>
  );
}

function CommentForm({ number, onPosted }: { number: string; onPosted(): void }) {
  const api = useApi();
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setError('Write a comment first.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await api(`/api/requests/${number}/comments`, { method: 'POST', body: JSON.stringify({ text: text.trim() }) });
      setText('');
      onPosted();
    } catch (failure) {
      setError(asApiError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Form noValidate onSubmit={submit} aria-label="New comment">
      <Field id="comment-text" label="Add a comment" error={error}>
        <Form.Control as="textarea" rows={2} value={text} onChange={(event) => setText(event.target.value)} />
      </Field>
      <Button type="submit" variant="outline-primary" disabled={busy}>
        Post comment
      </Button>
    </Form>
  );
}
