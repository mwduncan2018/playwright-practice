import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { ErrorMessage, Loading, RoleBadge } from '../components/Feedback';
import { plural } from '../format';
import { useParamState, useParamUpdater } from '../searchParams';
import type { Person } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function PeoplePage() {
  usePageTitle('People');
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const [search, setSearch] = useParamState(params, 'search', update, 300);
  const [department, setDepartment] = useParamState(params, 'department', update);
  const departments = useLoad<string[]>('/api/people/departments');

  const query = new URLSearchParams();
  for (const key of ['search', 'department']) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  const { data, error, loading, reload } = useLoad<Person[]>(`/api/people?${query}`);
  const hasFilters = params.has('search') || params.has('department');

  return (
    <>
      <h1 className="h3 mb-3">People</h1>
      <Card className="mb-3">
        <Card.Body>
          <Form role="search" aria-label="Filter people" onSubmit={(event) => event.preventDefault()}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="filter-search">
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Name, username or job title"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filter-department">
                  <Form.Label>Department</Form.Label>
                  <Form.Select value={department} onChange={(event) => setDepartment(event.target.value)}>
                    <option value="">All departments</option>
                    {departments.data?.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  onClick={() => update({ search: null, department: null })}
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
        {data && (data.length > 0 ? `Showing ${plural(data.length, 'person', 'people')}` : 'No one matches these filters.')}
      </p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <Table striped hover responsive className="align-middle" aria-label="People">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Job title</th>
              <th scope="col">Department</th>
              <th scope="col">Location</th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
            {data.map((person) => (
              <tr key={person.username}>
                <td>
                  <Link to={`/people/${person.username}`}>{person.name}</Link>
                </td>
                <td>{person.title}</td>
                <td>{person.department}</td>
                <td>{person.location}</td>
                <td>
                  <RoleBadge role={person.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
