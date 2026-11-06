import { Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { ErrorMessage, Loading } from '../components/Feedback';
import { LinkButton } from '../components/LinkButton';
import { plural } from '../format';
import { useParamState, useParamUpdater } from '../searchParams';
import type { Supplier } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function SuppliersPage() {
  usePageTitle('Suppliers');
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const [search, setSearch] = useParamState(params, 'search', update, 300);
  const [country, setCountry] = useParamState(params, 'country', update);
  const countries = useLoad<string[]>('/api/suppliers/countries');

  const query = new URLSearchParams();
  for (const key of ['search', 'country']) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  const { data, error, loading, reload } = useLoad<Supplier[]>(`/api/suppliers?${query}`);
  const hasFilters = params.has('search') || params.has('country');

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Suppliers</h1>
        {user.isAdmin && (
          <LinkButton to="/suppliers/new">New supplier</LinkButton>
        )}
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Form role="search" aria-label="Filter suppliers" onSubmit={(event) => event.preventDefault()}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="filter-search">
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Supplier or contact name"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="filter-country">
                  <Form.Label>Country</Form.Label>
                  <Form.Select value={country} onChange={(event) => setCountry(event.target.value)}>
                    <option value="">All countries</option>
                    {countries.data?.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  onClick={() => update({ search: null, country: null })}
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
        {data && (data.length > 0 ? `Showing ${plural(data.length, 'supplier')}` : 'No suppliers match these filters.')}
      </p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <Table striped hover responsive className="align-middle" aria-label="Suppliers">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Contact</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Country</th>
              <th scope="col" className="text-end">
                Products
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <Link to={`/suppliers/${supplier.id}`}>{supplier.name}</Link>
                </td>
                <td>{supplier.contact_name || '—'}</td>
                <td>{supplier.email ? <a href={`mailto:${supplier.email}`}>{supplier.email}</a> : '—'}</td>
                <td className="text-nowrap">{supplier.phone || '—'}</td>
                <td>{supplier.country || '—'}</td>
                <td className="text-end">{supplier.product_count}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
