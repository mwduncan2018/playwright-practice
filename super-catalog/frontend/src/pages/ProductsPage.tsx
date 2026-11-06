import { useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { ErrorMessage, Loading, StatusBadge } from '../components/Feedback';
import { LinkButton } from '../components/LinkButton';
import { SortableHeader } from '../components/SortableHeader';
import { TablePagination } from '../components/TablePagination';
import { useToast } from '../components/Toasts';
import { formatPrice, plural, showing } from '../format';
import { useParamState, useParamUpdater } from '../searchParams';
import { type Category, PRODUCT_STATUSES, type Page, type Product, type Supplier } from '../types';
import { usePageTitle } from '../usePageTitle';

const SORT_FIELDS = ['sku', 'name', 'category', 'supplier', 'price', 'stock', 'status'] as const;
type SortField = (typeof SORT_FIELDS)[number];
const FILTERS = ['search', 'category_id', 'supplier_id', 'status', 'low_stock', 'min_price', 'max_price'];
const PAGE_SIZES = [10, 25, 50];

export default function ProductsPage() {
  usePageTitle('Products');
  const auth = useAuth();
  const notify = useToast();
  const [params, setParams] = useSearchParams();
  const update = useParamUpdater(setParams);
  const [search, setSearch] = useParamState(params, 'search', update, 300);
  const [minPrice, setMinPrice] = useParamState(params, 'min_price', update, 300);
  const [maxPrice, setMaxPrice] = useParamState(params, 'max_price', update, 300);
  const [categoryId, setCategoryId] = useParamState(params, 'category_id', update);
  const [supplierId, setSupplierId] = useParamState(params, 'supplier_id', update);
  const [status, setStatus] = useParamState(params, 'status', update);
  const [lowStock, setLowStock] = useParamState(params, 'low_stock', update);
  const [exporting, setExporting] = useState(false);
  const categories = useLoad<Category[]>('/api/categories');
  const suppliers = useLoad<Supplier[]>('/api/suppliers');

  const sortParam = params.get('sort') ?? '';
  const sort: SortField = (SORT_FIELDS as readonly string[]).includes(sortParam) ? (sortParam as SortField) : 'name';
  const order = params.get('order') === 'desc' ? 'desc' : 'asc';
  const page = Math.max(1, Math.floor(Number(params.get('page'))) || 1);
  const pageSize = PAGE_SIZES.includes(Number(params.get('page_size'))) ? Number(params.get('page_size')) : 10;

  // The API takes the same parameter names as the address.
  const query = new URLSearchParams();
  for (const key of FILTERS) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  query.set('sort', sort);
  query.set('order', order);
  const result = useLoad<Page<Product>>(`/api/products?${query}&page=${page}&page_size=${pageSize}`);
  const hasFilters = FILTERS.some((key) => params.has(key));

  function sortBy(field: SortField) {
    update({ sort: field, order: field === sort && order === 'asc' ? 'desc' : 'asc' });
  }

  function clearFilters() {
    update(Object.fromEntries(FILTERS.map((key) => [key, null])));
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const response = await fetch(`/api/products/export.csv?${query}`, {
        headers: { Authorization: `Bearer ${await auth.getToken()}` },
      });
      if (!response.ok) throw new Error(`Export failed with ${response.status}`);
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'products.csv';
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      notify(`Exported ${plural(result.data?.total ?? 0, 'product')} to ${filename}.`);
    } catch {
      notify("The export didn't work. Try again.", 'danger');
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Products</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={exportCsv} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
          {auth.user.isAdmin && (
            <LinkButton to="/products/new">New product</LinkButton>
          )}
        </div>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Form role="search" aria-label="Filter products" onSubmit={(event) => event.preventDefault()}>
            <Row className="g-3 align-items-end">
              <Col lg={4}>
                <Form.Group controlId="filter-search">
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Name or SKU"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col sm={4} lg={3}>
                <Form.Group controlId="filter-category">
                  <Form.Label>Category</Form.Label>
                  <Form.Select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                    <option value="">All categories</option>
                    {categories.data?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={4} lg={3}>
                <Form.Group controlId="filter-supplier">
                  <Form.Label>Supplier</Form.Label>
                  <Form.Select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
                    <option value="">All suppliers</option>
                    {suppliers.data?.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={4} lg={2}>
                <Form.Group controlId="filter-status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="">All statuses</option>
                    {PRODUCT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6} sm={3} lg={2}>
                <Form.Group controlId="filter-min-price">
                  <Form.Label>Min price</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={6} sm={3} lg={2}>
                <Form.Group controlId="filter-max-price">
                  <Form.Label>Max price</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs="auto" className="pb-2">
                <Form.Check
                  id="filter-low-stock"
                  label="Low stock only"
                  checked={lowStock === 'true'}
                  onChange={(event) => setLowStock(event.target.checked ? 'true' : '')}
                />
              </Col>
              <Col xs="auto">
                <Button variant="outline-secondary" onClick={clearFilters} disabled={!hasFilters}>
                  Clear filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <p role="status" className="text-body-secondary mb-2">
        {result.data &&
          showing(result.data.page, result.data.page_size, result.data.total, 'product', 'No products match these filters.')}
      </p>
      {result.error && <ErrorMessage error={result.error} onRetry={result.reload} />}
      {result.loading && !result.data && <Loading />}
      {result.data && (
        <>
          <Table striped hover responsive className="align-middle" aria-label="Products">
            <thead>
              <tr>
                <SortableHeader field="sku" label="SKU" sort={sort} order={order} onSort={sortBy} />
                <SortableHeader field="name" label="Name" sort={sort} order={order} onSort={sortBy} />
                <SortableHeader field="category" label="Category" sort={sort} order={order} onSort={sortBy} />
                <SortableHeader field="supplier" label="Supplier" sort={sort} order={order} onSort={sortBy} />
                <SortableHeader field="price" label="Price" sort={sort} order={order} onSort={sortBy} className="text-end" />
                <SortableHeader field="stock" label="Stock" sort={sort} order={order} onSort={sortBy} className="text-end" />
                <SortableHeader field="status" label="Status" sort={sort} order={order} onSort={sortBy} />
              </tr>
            </thead>
            <tbody>
              {result.data.items.map((product) => (
                <tr key={product.id} data-testid={`product-row-${product.sku}`}>
                  <td className="text-nowrap">{product.sku}</td>
                  <td>
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </td>
                  <td>{product.category_name}</td>
                  <td>{product.supplier_name ?? '—'}</td>
                  <td className="text-end">{formatPrice(product.price)}</td>
                  <td className="text-end text-nowrap">
                    {product.stock}
                    {product.low_stock && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        Low
                      </Badge>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <TablePagination
            name="products"
            label="Product pages"
            page={result.data.page}
            pageSize={result.data.page_size}
            total={result.data.total}
            onPage={(number) => update({ page: String(number) }, true)}
            onPageSize={(size) => update({ page_size: String(size) })}
          />
        </>
      )}
    </>
  );
}
