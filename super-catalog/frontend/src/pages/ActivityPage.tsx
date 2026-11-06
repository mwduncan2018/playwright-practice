import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { ErrorMessage, Loading } from '../components/Feedback';
import { TablePagination } from '../components/TablePagination';
import { formatDateTime, showing } from '../format';
import { useParamState, useParamUpdater } from '../searchParams';
import type { Activity, ActivityUser, Page } from '../types';
import { usePageTitle } from '../usePageTitle';

const FILTERS = ['username', 'action', 'entity_type', 'date_from', 'date_to'];
const ACTION_COLORS: Record<string, string> = { Created: 'success', Updated: 'primary', Deleted: 'danger' };

export default function ActivityPage() {
  usePageTitle('Activity log');
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const [username, setUsername] = useParamState(params, 'username', update);
  const [action, setAction] = useParamState(params, 'action', update);
  const [entityType, setEntityType] = useParamState(params, 'entity_type', update);
  const [dateFrom, setDateFrom] = useParamState(params, 'date_from', update);
  const [dateTo, setDateTo] = useParamState(params, 'date_to', update);
  const users = useLoad<ActivityUser[]>('/api/activity/users');
  const page = Math.max(1, Math.floor(Number(params.get('page'))) || 1);

  const query = new URLSearchParams();
  for (const key of FILTERS) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  query.set('page', String(page));
  query.set('page_size', '20');
  const { data, error, loading, reload } = useLoad<Page<Activity>>(`/api/activity?${query}`);
  const hasFilters = FILTERS.some((key) => params.has(key));

  return (
    <>
      <h1 className="h3 mb-3">Activity log</h1>
      <Card className="mb-3">
        <Card.Body>
          <Form role="search" aria-label="Filter the activity log" onSubmit={(event) => event.preventDefault()}>
            <Row className="g-3 align-items-end">
              <Col sm={6} lg={3}>
                <Form.Group controlId="filter-user">
                  <Form.Label>User</Form.Label>
                  <Form.Select value={username} onChange={(event) => setUsername(event.target.value)}>
                    <option value="">Everyone</option>
                    {users.data?.map((user) => (
                      <option key={user.username} value={user.username}>
                        {user.name} ({user.username})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6} lg={2}>
                <Form.Group controlId="filter-action">
                  <Form.Label>Action</Form.Label>
                  <Form.Select value={action} onChange={(event) => setAction(event.target.value)}>
                    <option value="">All actions</option>
                    <option value="Created">Created</option>
                    <option value="Updated">Updated</option>
                    <option value="Deleted">Deleted</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6} lg={2}>
                <Form.Group controlId="filter-type">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={entityType} onChange={(event) => setEntityType(event.target.value)}>
                    <option value="">All types</option>
                    <option value="Product">Product</option>
                    <option value="Category">Category</option>
                    <option value="Supplier">Supplier</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} sm={3} lg={2}>
                <Form.Group controlId="filter-date-from">
                  <Form.Label>From (UTC)</Form.Label>
                  <Form.Control type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                </Form.Group>
              </Col>
              <Col xs={6} sm={3} lg={2}>
                <Form.Group controlId="filter-date-to">
                  <Form.Label>To (UTC)</Form.Label>
                  <Form.Control type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                </Form.Group>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  onClick={() => update(Object.fromEntries(FILTERS.map((key) => [key, null])))}
                  disabled={!hasFilters}
                >
                  Clear filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <p role="status" className="text-body-secondary mb-2">
        {data && showing(data.page, data.page_size, data.total, 'entry', 'No entries match these filters.', 'entries')}
      </p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <>
          <Table striped hover responsive className="align-middle" aria-label="Activity log">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">User</th>
                <th scope="col">Action</th>
                <th scope="col">Type</th>
                <th scope="col">Item</th>
                <th scope="col">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-nowrap">{formatDateTime(entry.at)}</td>
                  <td className="text-nowrap">{entry.user_display_name}</td>
                  <td>
                    <Badge bg={ACTION_COLORS[entry.action] ?? 'secondary'}>{entry.action}</Badge>
                  </td>
                  <td>{entry.entity_type}</td>
                  <td>{entry.entity_label}</td>
                  <td className="small">{entry.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <TablePagination
            name="activity"
            label="Activity log pages"
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            onPage={(number) => update({ page: String(number) }, true)}
          />
        </>
      )}
    </>
  );
}
