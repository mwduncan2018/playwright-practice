import { Card, Col, ListGroup, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { ErrorMessage, Loading } from '../components/Feedback';
import { formatDateTime } from '../format';
import type { Dashboard } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const { data, error, loading, reload } = useLoad<Dashboard>('/api/dashboard');

  return (
    <>
      <h1 className="h3">Dashboard</h1>
      <p className="text-body-secondary">Welcome, {user.name}.</p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <>
          <Row xs={2} md={3} xl={5} className="g-3 mb-4">
            <Stat testId="stat-products" label="Products" value={data.product_count} to="/products" />
            <Stat testId="stat-active" label="Active products" value={data.active_count} to="/products?status=Active" />
            <Stat testId="stat-low-stock" label="Low stock" value={data.low_stock_count} to="/products?low_stock=true" />
            <Stat testId="stat-categories" label="Categories" value={data.category_count} to="/categories" />
            <Stat testId="stat-suppliers" label="Suppliers" value={data.supplier_count} to="/suppliers" />
          </Row>
          <Row className="g-4">
            <Col lg={6}>
              <Card>
                <Card.Header as="h2" className="h6 mb-0 py-3">
                  Lowest stock
                </Card.Header>
                <Table size="sm" className="mb-0" aria-label="Lowest stock">
                  <thead>
                    <tr>
                      <th scope="col" className="ps-3">SKU</th>
                      <th scope="col">Product</th>
                      <th scope="col" className="text-end pe-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.low_stock.map((product) => (
                      <tr key={product.id}>
                        <td className="ps-3">{product.sku}</td>
                        <td>
                          <Link to={`/products/${product.id}`}>{product.name}</Link>
                        </td>
                        <td className="text-end pe-3">{product.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Card.Footer>
                  <Link to="/products?low_stock=true">See all low-stock products</Link>
                </Card.Footer>
              </Card>
            </Col>
            <Col lg={6}>
              <Card>
                <Card.Header as="h2" className="h6 mb-0 py-3">
                  Recently updated
                </Card.Header>
                <ListGroup as="ul" variant="flush" aria-label="Recently updated">
                  {data.recently_updated.map((product) => (
                    <ListGroup.Item as="li" key={product.id}>
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                      <div className="small text-body-secondary">
                        {product.sku} · {product.updated_by} · {formatDateTime(product.updated_at)}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

function Stat({ testId, label, value, to }: { testId: string; label: string; value: number; to: string }) {
  return (
    <Col>
      <Card className="h-100" data-testid={testId}>
        <Card.Body>
          <div className="stat-value">{value}</div>
          <Link to={to} className="stretched-link text-body-secondary text-decoration-none">
            {label}
          </Link>
        </Card.Body>
      </Card>
    </Col>
  );
}
