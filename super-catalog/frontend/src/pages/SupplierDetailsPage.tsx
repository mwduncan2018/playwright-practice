import { useState } from 'react';
import { Breadcrumb, Button, Card, Table } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { useAuth } from '../auth';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Detail } from '../components/Detail';
import { LinkButton } from '../components/LinkButton';
import { ErrorMessage, Loading, NotFoundMessage, StatusBadge } from '../components/Feedback';
import { useToast } from '../components/Toasts';
import { formatPrice } from '../format';
import type { Page, Product, Supplier } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const api = useApi();
  const notify = useToast();
  const navigate = useNavigate();
  const loaded = useLoad<Supplier>(`/api/suppliers/${id}`);
  const products = useLoad<Page<Product>>(`/api/products?supplier_id=${id}&sort=name&page_size=100`);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  usePageTitle(loaded.data?.name ?? 'Supplier');

  if (loaded.error?.status === 404) {
    return <NotFoundMessage what="supplier" back="/suppliers" backLabel="Back to suppliers" />;
  }
  const supplier = loaded.data;
  if (!supplier) return loaded.error ? <ErrorMessage error={loaded.error} onRetry={loaded.reload} /> : <Loading />;

  async function remove() {
    if (!supplier) return;
    setDeleting(true);
    try {
      await api(`/api/suppliers/${supplier.id}`, { method: 'DELETE' });
      notify(`Deleted ${supplier.name}.`);
      navigate('/suppliers');
    } catch (failure) {
      setDeleteError(asApiError(failure).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/suppliers' }}>
          Suppliers
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{supplier.name}</Breadcrumb.Item>
      </Breadcrumb>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <h1 className="h3 mb-0">{supplier.name}</h1>
        {user.isAdmin && (
          <div className="d-flex gap-2">
            <LinkButton to={`/suppliers/${supplier.id}/edit`}>Edit</LinkButton>
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
      <Card className="mb-4" style={{ maxWidth: 720 }}>
        <Card.Body>
          <dl className="row mb-0">
            <Detail label="Contact" testId="supplier-contact">
              {supplier.contact_name || 'None'}
            </Detail>
            <Detail label="Email" testId="supplier-email">
              {supplier.email ? <a href={`mailto:${supplier.email}`}>{supplier.email}</a> : 'None'}
            </Detail>
            <Detail label="Phone" testId="supplier-phone">
              {supplier.phone || 'None'}
            </Detail>
            <Detail label="Country" testId="supplier-country">
              {supplier.country || 'None'}
            </Detail>
            <Detail label="Products" testId="supplier-product-count">
              {supplier.product_count}
            </Detail>
          </dl>
        </Card.Body>
      </Card>

      <h2 className="h5">Products from {supplier.name}</h2>
      {products.error && <ErrorMessage error={products.error} onRetry={products.reload} />}
      {products.data &&
        (products.data.items.length === 0 ? (
          <p className="text-body-secondary">{supplier.name} doesn't supply any products yet.</p>
        ) : (
          <Table striped hover responsive size="sm" className="align-middle" aria-label={`Products from ${supplier.name}`}>
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Name</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-end">
                  Price
                </th>
                <th scope="col" className="text-end">
                  Stock
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.data.items.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </td>
                  <td>{product.category_name}</td>
                  <td className="text-end">{formatPrice(product.price)}</td>
                  <td className="text-end">{product.stock}</td>
                  <td>
                    <StatusBadge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}

      <ConfirmDialog
        show={confirmOpen}
        title="Delete supplier"
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      >
        Delete <strong>{supplier.name}</strong>? This can't be undone.
      </ConfirmDialog>
    </>
  );
}
