import { useState } from 'react';
import { Badge, Breadcrumb, Button, Card, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { useAuth } from '../auth';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Detail } from '../components/Detail';
import { LinkButton } from '../components/LinkButton';
import { ErrorMessage, Loading, NotFoundMessage, StatusBadge } from '../components/Feedback';
import { useToast } from '../components/Toasts';
import { formatDateTime, formatPrice } from '../format';
import type { Product } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const api = useApi();
  const notify = useToast();
  const navigate = useNavigate();
  const { data: product, error, loading, reload } = useLoad<Product>(`/api/products/${id}`);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  usePageTitle(product ? `${product.sku} ${product.name}` : 'Product');

  if (error?.status === 404) {
    return <NotFoundMessage what="product" back="/products" backLabel="Back to products" />;
  }
  if (!product) return error ? <ErrorMessage error={error} onRetry={reload} /> : loading ? <Loading /> : null;

  async function remove() {
    if (!product) return;
    setDeleting(true);
    try {
      await api(`/api/products/${product.id}`, { method: 'DELETE' });
      notify(`Deleted ${product.sku} ${product.name}.`);
      navigate('/products');
    } catch (failure) {
      setDeleteError(asApiError(failure).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>
          Products
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{product.sku}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h1 className="h3 mb-1">{product.name}</h1>
          <div className="text-body-secondary">
            {product.sku} <StatusBadge status={product.status} />
          </div>
        </div>
        {user.isAdmin && (
          <div className="d-flex gap-2">
            <LinkButton to={`/products/${product.id}/edit`}>Edit</LinkButton>
            <Button
              variant="outline-danger"
              onClick={() => {
                setDeleteError(undefined);
                setConfirmOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      <Row className="g-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <dl className="row mb-0">
                <Detail label="SKU" testId="product-sku">
                  {product.sku}
                </Detail>
                <Detail label="Category" testId="product-category">
                  <Link to={`/products?category_id=${product.category_id}`}>{product.category_name}</Link>
                </Detail>
                <Detail label="Supplier" testId="product-supplier">
                  {product.supplier_id ? <Link to={`/suppliers/${product.supplier_id}`}>{product.supplier_name}</Link> : 'None'}
                </Detail>
                <Detail label="Price" testId="product-price">
                  {formatPrice(product.price)}
                </Detail>
                <Detail label="Stock" testId="product-stock">
                  {product.stock}
                  {product.low_stock && (
                    <Badge bg="warning" text="dark" className="ms-2">
                      Low stock
                    </Badge>
                  )}
                </Detail>
                <Detail label="Reorder level" testId="product-reorder-level">
                  {product.reorder_level}
                </Detail>
                <Detail label="Status" testId="product-status">
                  {product.status}
                </Detail>
                <Detail label="Description" testId="product-description">
                  {product.description || 'None'}
                </Detail>
                <Detail label="Created" testId="product-created">
                  {formatDateTime(product.created_at)} by {product.created_by}
                </Detail>
                <Detail label="Last updated" testId="product-updated">
                  {formatDateTime(product.updated_at)} by {product.updated_by}
                </Detail>
              </dl>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          {product.image_url ? (
            <img src={product.image_url} alt={`Photo of ${product.name}`} className="img-fluid rounded border" />
          ) : (
            <div className="border rounded p-4 text-center text-body-secondary">No image</div>
          )}
        </Col>
      </Row>
      <ConfirmDialog
        show={confirmOpen}
        title="Delete product"
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      >
        Delete{' '}
        <strong>
          {product.sku} {product.name}
        </strong>
        ? This can't be undone.
      </ConfirmDialog>
    </>
  );
}
