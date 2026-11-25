import { useState } from 'react';
import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { REQUEST_TYPES } from '../choices';
import { DecisionDialog } from '../components/DecisionDialog';
import { ErrorMessage, Loading, PriorityBadge } from '../components/Feedback';
import { useToast } from '../components/Toasts';
import { plural, waitingTime } from '../format';
import { useParamState, useParamUpdater } from '../searchParams';
import type { RequestSummary } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function ApprovalsPage() {
  usePageTitle('Approvals');
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const [type, setType] = useParamState(params, 'type', update);
  const typeParam = params.get('type');
  const { data, error, loading, reload } = useLoad<RequestSummary[]>(`/api/approvals${typeParam ? `?type=${typeParam}` : ''}`);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [target, setTarget] = useState<RequestSummary>();
  const [decision, setDecision] = useState<'approve' | 'reject'>('approve');

  function open(request: RequestSummary, which: 'approve' | 'reject') {
    setTarget(request);
    setDecision(which);
    setDialogOpen(true);
  }

  return (
    <>
      <h1 className="h3" data-testid="approvals-heading">
        Approvals
      </h1>
      <p className="text-body-secondary" data-testid="approvals-intro-text">
        Requests waiting for a decision, oldest first. Your own requests aren't listed: another admin decides on them.
      </p>
      <Card className="mb-3" data-testid="approvals-filter-card">
        <Card.Body>
          <Form
            role="search"
            aria-label="Filter approvals"
            onSubmit={(event) => event.preventDefault()}
            data-testid="approvals-filter-form"
          >
            <Row className="g-3 align-items-end">
              <Col sm={6} md={3}>
                <Form.Group controlId="filter-type">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    data-testid="approvals-type-select"
                  >
                    <option value="">All types</option>
                    {REQUEST_TYPES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <p role="status" className="text-body-secondary mb-2" data-testid="approvals-summary-text">
        {data && (data.length > 0 ? `${plural(data.length, 'request')} waiting` : 'Nothing is waiting for approval.')}
      </p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && data.length > 0 && (
        <Table
          striped
          hover
          responsive
          className="align-middle"
          aria-label="Waiting for approval"
          data-testid="approvals-table"
        >
          <thead>
            <tr data-testid="approvals-table-header-row">
              <th scope="col" data-testid="approvals-table-number-header">
                Number
              </th>
              <th scope="col" data-testid="approvals-table-title-header">
                Title
              </th>
              <th scope="col" data-testid="approvals-table-requester-header">
                Requester
              </th>
              <th scope="col" data-testid="approvals-table-priority-header">
                Priority
              </th>
              <th scope="col" data-testid="approvals-table-waiting-header">
                Waiting
              </th>
              <th scope="col" data-testid="approvals-table-needed-by-header">
                Needed by
              </th>
              <th scope="col" data-testid="approvals-table-actions-header">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((request) => (
              <tr key={request.number} data-testid={`request-row-${request.number}`}>
                <td className="text-nowrap" data-testid="number-cell">
                  <Link to={`/requests/${request.number}`} data-testid="request-number-link">
                    {request.number}
                  </Link>
                </td>
                <td data-testid="title-cell">{request.title}</td>
                <td className="text-nowrap" data-testid="requester-cell">
                  {request.requester_name}
                </td>
                <td data-testid="priority-cell">
                  <PriorityBadge priority={request.priority} />
                </td>
                <td className="text-nowrap" data-testid="waiting-cell">
                  {waitingTime(request.created_at)}
                </td>
                <td className="text-nowrap" data-testid="needed-by-cell">
                  {request.needed_by ?? '—'}
                </td>
                <td className="text-end text-nowrap" data-testid="actions-cell">
                  <Button
                    size="sm"
                    variant="success"
                    className="me-2"
                    aria-label={`Approve ${request.number}`}
                    onClick={() => open(request, 'approve')}
                    data-testid="approve-button"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    aria-label={`Reject ${request.number}`}
                    onClick={() => open(request, 'reject')}
                    data-testid="reject-button"
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <DecisionDialog
        show={dialogOpen}
        request={target}
        decision={decision}
        onClose={() => setDialogOpen(false)}
        onDecided={(updated) => {
          notify(`${updated.status} ${updated.number}.`);
          setDialogOpen(false);
          reload();
        }}
      />
    </>
  );
}
