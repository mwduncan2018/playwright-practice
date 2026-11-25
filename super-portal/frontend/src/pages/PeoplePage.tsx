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
      <h1 className="h3 mb-3" data-testid="people-heading">
        People
      </h1>
      <Card className="mb-3" data-testid="people-filter-card">
        <Card.Body>
          <Form
            role="search"
            aria-label="Filter people"
            onSubmit={(event) => event.preventDefault()}
            data-testid="people-filter-form"
          >
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="filter-search">
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Name, username or job title"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    data-testid="people-search-input"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filter-department">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    data-testid="people-department-select"
                  >
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
                  data-testid="people-clear-filters-button"
                >
                  Clear filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <p role="status" className="text-body-secondary mb-2" data-testid="people-summary-text">
        {data && (data.length > 0 ? `Showing ${plural(data.length, 'person', 'people')}` : 'No one matches these filters.')}
      </p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <Table striped hover responsive className="align-middle" aria-label="People" data-testid="people-table">
          <thead>
            <tr data-testid="people-table-header-row">
              <th scope="col" data-testid="people-table-name-header">
                Name
              </th>
              <th scope="col" data-testid="people-table-job-title-header">
                Job title
              </th>
              <th scope="col" data-testid="people-table-department-header">
                Department
              </th>
              <th scope="col" data-testid="people-table-location-header">
                Location
              </th>
              <th scope="col" data-testid="people-table-role-header">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((person) => (
              <tr key={person.username} data-testid={`person-row-${person.username}`}>
                <td data-testid="name-cell">
                  <Link to={`/people/${person.username}`} data-testid="person-link">
                    {person.name}
                  </Link>
                </td>
                <td data-testid="job-title-cell">{person.title}</td>
                <td data-testid="department-cell">{person.department}</td>
                <td data-testid="location-cell">{person.location}</td>
                <td data-testid="role-cell">
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
