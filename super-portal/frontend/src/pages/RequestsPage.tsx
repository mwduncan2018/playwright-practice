import { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { PRIORITIES, REQUEST_TYPES, STATUSES } from '../choices';
import { type ColumnChoice, loadColumnChoices, saveColumnChoices, shownColumns } from '../columnLayout';
import { ColumnsDialog } from '../components/ColumnsDialog';
import { ErrorMessage, Loading } from '../components/Feedback';
import { LinkButton } from '../components/LinkButton';
import { OWN_REQUEST_COLUMNS, RequestsTable } from '../components/RequestsTable';
import { TablePagination } from '../components/TablePagination';
import { showing } from '../format';
import { useParamState, useParamUpdater } from '../searchParams';
import type { Page, Person, RequestSummary, UserSettings } from '../types';
import { usePageTitle } from '../usePageTitle';

export function MyRequestsPage() {
  return <RequestsList scope="mine" />;
}

export function AllRequestsPage() {
  return <RequestsList scope="all" />;
}

/**
 * My requests, or (for admins) everyone's. Filters live in the address; rows per page come from
 * Settings. All requests also has a Columns button, and the columns chosen are saved in the browser.
 */
function RequestsList({ scope }: { scope: 'mine' | 'all' }) {
  const everyone = scope === 'all';
  const title = everyone ? 'All requests' : 'My requests';
  usePageTitle(title);
  const { user } = useAuth();
  const [columnChoices, setColumnChoices] = useState(() => loadColumnChoices(user.username));
  // A new key each time the dialog opens, so it starts from the table's columns, not from what was last cancelled.
  const [columnsDialog, setColumnsDialog] = useState({ show: false, key: 0 });
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const [search, setSearch] = useParamState(params, 'search', update, 300);
  const [status, setStatus] = useParamState(params, 'status', update);
  const [type, setType] = useParamState(params, 'type', update);
  const [priority, setPriority] = useParamState(params, 'priority', update);
  const [requester, setRequester] = useParamState(params, 'requester', update);
  const settings = useLoad<UserSettings>('/api/settings');
  const people = useLoad<Person[]>(everyone ? '/api/people' : null);

  const filters = everyone ? ['search', 'status', 'type', 'priority', 'requester'] : ['search', 'status', 'type'];
  const page = Math.max(1, Math.floor(Number(params.get('page'))) || 1);
  const query = new URLSearchParams({ scope });
  for (const key of filters) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  query.set('page', String(page));
  query.set('page_size', String(settings.data?.page_size ?? 10));
  const result = useLoad<Page<RequestSummary>>(settings.loading ? null : `/api/requests?${query}`);
  const hasFilters = filters.some((key) => params.has(key));

  function saveColumns(choices: ColumnChoice[]) {
    setColumnChoices(choices);
    saveColumnChoices(user.username, choices);
    setColumnsDialog({ ...columnsDialog, show: false });
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">{title}</h1>
        {!everyone && <LinkButton to="/catalog">New request</LinkButton>}
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Form role="search" aria-label="Filter requests" onSubmit={(event) => event.preventDefault()}>
            <Row className="g-3 align-items-end">
              <Col md={everyone ? 3 : 5}>
                <Form.Group controlId="filter-search">
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Number or title"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col sm={6} md={2}>
                <Form.Group controlId="filter-status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="">All statuses</option>
                    {STATUSES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6} md={2}>
                <Form.Group controlId="filter-type">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={type} onChange={(event) => setType(event.target.value)}>
                    <option value="">All types</option>
                    {REQUEST_TYPES.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {everyone && (
                <>
                  <Col sm={6} md={2}>
                    <Form.Group controlId="filter-priority">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select value={priority} onChange={(event) => setPriority(event.target.value)}>
                        <option value="">All priorities</option>
                        {PRIORITIES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col sm={6} md={3}>
                    <Form.Group controlId="filter-requester">
                      <Form.Label>Requester</Form.Label>
                      <Form.Select value={requester} onChange={(event) => setRequester(event.target.value)}>
                        <option value="">Everyone</option>
                        {people.data?.map((person) => (
                          <option key={person.username} value={person.username}>
                            {person.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </>
              )}
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  onClick={() => update(Object.fromEntries(filters.map((key) => [key, null])))}
                  disabled={!hasFilters}
                >
                  Clear filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <p role="status" className="text-body-secondary mb-0">
          {result.data &&
            showing(result.data.page, result.data.page_size, result.data.total, 'request', 'No requests match these filters.')}
        </p>
        {everyone && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setColumnsDialog({ show: true, key: columnsDialog.key + 1 })}
          >
            Columns
          </Button>
        )}
      </div>
      {everyone && (
        <ColumnsDialog
          key={columnsDialog.key}
          show={columnsDialog.show}
          choices={columnChoices}
          onSave={saveColumns}
          onClose={() => setColumnsDialog({ ...columnsDialog, show: false })}
        />
      )}
      {result.error && <ErrorMessage error={result.error} onRetry={result.reload} />}
      {(settings.loading || (result.loading && !result.data)) && <Loading />}
      {result.data && (
        <>
          <RequestsTable
            requests={result.data.items}
            label={title}
            columns={everyone ? shownColumns(columnChoices) : OWN_REQUEST_COLUMNS}
          />
          <TablePagination
            name="requests"
            label={`${title} pages`}
            page={result.data.page}
            pageSize={result.data.page_size}
            total={result.data.total}
            onPage={(number) => update({ page: String(number) }, true)}
          />
        </>
      )}
    </>
  );
}
