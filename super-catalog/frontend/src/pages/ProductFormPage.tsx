import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Alert, Breadcrumb, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { ErrorMessage, Loading, NotFoundMessage } from '../components/Feedback';
import { Field } from '../components/Field';
import { LinkButton } from '../components/LinkButton';
import { useToast } from '../components/Toasts';
import { type Category, PRODUCT_STATUSES, type Product, type ProductStatus, type Supplier } from '../types';
import { usePageTitle } from '../usePageTitle';

interface Values {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  supplierId: string;
  price: string;
  stock: string;
  reorderLevel: string;
  status: ProductStatus;
}

type Errors = Partial<Record<keyof Values | 'image', string>>;
type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const EMPTY: Values = {
  sku: '',
  name: '',
  description: '',
  categoryId: '',
  supplierId: '',
  price: '',
  stock: '0',
  reorderLevel: '10',
  status: 'Active',
};
const SKU_PATTERN = /^[A-Z]{3}-\d{4}$/;
const MAX_IMAGE_BYTES = 1024 * 1024;
// The API's field names, mapped to this form's.
const API_FIELDS: Record<string, keyof Errors> = {
  sku: 'sku',
  name: 'name',
  category_id: 'categoryId',
  supplier_id: 'supplierId',
  image: 'image',
};

function isWholeNumber(text: string): boolean {
  return /^\d+$/.test(text.trim()) && Number(text) <= 1_000_000;
}

function validate(values: Values, image: File | null): Errors {
  const errors: Errors = {};
  if (!SKU_PATTERN.test(values.sku.trim())) {
    errors.sku = 'Enter a SKU like ABC-1234: three capital letters, a dash and four digits.';
  }
  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (!values.categoryId) errors.categoryId = 'Choose a category.';
  const price = Number(values.price);
  if (values.price.trim() === '' || !Number.isFinite(price) || price <= 0 || price > 100_000) {
    errors.price = 'Enter a price greater than 0 and no more than 100,000.';
  }
  if (!isWholeNumber(values.stock)) errors.stock = 'Enter a whole number, 0 or more.';
  if (!isWholeNumber(values.reorderLevel)) errors.reorderLevel = 'Enter a whole number, 0 or more.';
  if (image && !['image/png', 'image/jpeg'].includes(image.type)) errors.image = 'Choose a PNG or JPEG image.';
  else if (image && image.size > MAX_IMAGE_BYTES) errors.image = 'Choose an image of 1 MB or less.';
  return errors;
}

/** /products/new and /products/:id/edit. The key gives each product a fresh form. */
export default function ProductFormPage() {
  const { id } = useParams();
  return <ProductForm key={id ?? 'new'} productId={id === undefined ? undefined : Number(id)} />;
}

function ProductForm({ productId }: { productId?: number }) {
  const editing = productId !== undefined;
  usePageTitle(editing ? 'Edit product' : 'New product');
  const api = useApi();
  const notify = useToast();
  const navigate = useNavigate();
  const existing = useLoad<Product>(editing ? `/api/products/${productId}` : null);
  const categories = useLoad<Category[]>('/api/categories');
  const suppliers = useLoad<Supplier[]>('/api/suppliers');
  const [values, setValues] = useState<Values>(EMPTY);
  const [filledFrom, setFilledFrom] = useState<number>();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fill the form once the product has loaded.
  const product = existing.data;
  if (product && filledFrom !== product.id) {
    setFilledFrom(product.id);
    setValues({
      sku: product.sku,
      name: product.name,
      description: product.description,
      categoryId: String(product.category_id),
      supplierId: product.supplier_id === null ? '' : String(product.supplier_id),
      price: product.price.toFixed(2),
      stock: String(product.stock),
      reorderLevel: String(product.reorder_level),
      status: product.status,
    });
  }

  if (editing && existing.error) {
    return existing.error.status === 404 ? (
      <NotFoundMessage what="product" back="/products" backLabel="Back to products" />
    ) : (
      <ErrorMessage error={existing.error} onRetry={existing.reload} />
    );
  }
  if (editing && !product) return <Loading />;

  const set = (key: keyof Values) => (event: ChangeEvent<FormElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
  };

  async function saveImage(id: number): Promise<string | undefined> {
    try {
      if (image) {
        const form = new FormData();
        form.append('file', image);
        await api(`/api/products/${id}/image`, { method: 'PUT', body: form });
      } else if (removeImage) {
        await api(`/api/products/${id}/image`, { method: 'DELETE' });
      }
    } catch (failure) {
      return `The product was saved, but the image wasn't: ${asApiError(failure).message}`;
    }
    return undefined;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validate(values, image);
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    const body = JSON.stringify({
      sku: values.sku.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      category_id: Number(values.categoryId),
      supplier_id: values.supplierId ? Number(values.supplierId) : null,
      price: Number(values.price),
      stock: Number(values.stock),
      reorder_level: Number(values.reorderLevel),
      status: values.status,
    });
    let saved: Product;
    try {
      saved = await api<Product>(editing ? `/api/products/${productId}` : '/api/products', {
        method: editing ? 'PUT' : 'POST',
        body,
      });
    } catch (failure) {
      const error = asApiError(failure);
      const field = error.field ? API_FIELDS[error.field] : undefined;
      if (field) setErrors({ [field]: error.message });
      else setFormError(error.message);
      setSaving(false);
      return;
    }
    const imageProblem = await saveImage(saved.id);
    notify(`${editing ? 'Saved changes to' : 'Created'} ${saved.sku} ${saved.name}.`);
    if (imageProblem) notify(imageProblem, 'warning');
    navigate(`/products/${saved.id}`);
  }

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/products' }}>
          Products
        </Breadcrumb.Item>
        {product && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/products/${product.id}` }}>
            {product.sku}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{editing ? 'Edit' : 'New product'}</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="h3 mb-3">{product ? `Edit ${product.name}` : 'New product'}</h1>
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Form noValidate onSubmit={submit} aria-label={editing ? 'Edit product' : 'New product'}>
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Field id="product-sku" label="SKU" error={errors.sku} help="For example ELE-1234.">
                  <Form.Control value={values.sku} onChange={set('sku')} autoComplete="off" />
                </Field>
              </Col>
              <Col md={8}>
                <Field id="product-name" label="Name" error={errors.name}>
                  <Form.Control value={values.name} onChange={set('name')} />
                </Field>
              </Col>
            </Row>
            <Field id="product-description" label="Description" error={errors.description}>
              <Form.Control as="textarea" rows={3} value={values.description} onChange={set('description')} />
            </Field>
            <Row>
              <Col md={6}>
                <Field id="product-category" label="Category" error={errors.categoryId}>
                  <Form.Select value={values.categoryId} onChange={set('categoryId')}>
                    <option value="">Choose a category</option>
                    {categories.data?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Field>
              </Col>
              <Col md={6}>
                <Field id="product-supplier" label="Supplier" error={errors.supplierId}>
                  <Form.Select value={values.supplierId} onChange={set('supplierId')}>
                    <option value="">No supplier</option>
                    {suppliers.data?.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Form.Select>
                </Field>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Field id="product-price" label="Price (USD)" error={errors.price}>
                  <Form.Control type="number" min="0.01" step="0.01" value={values.price} onChange={set('price')} />
                </Field>
              </Col>
              <Col md={4}>
                <Field id="product-stock" label="Stock" error={errors.stock}>
                  <Form.Control type="number" min="0" step="1" value={values.stock} onChange={set('stock')} />
                </Field>
              </Col>
              <Col md={4}>
                <Field
                  id="product-reorder-level"
                  label="Reorder level"
                  error={errors.reorderLevel}
                  help="Stock at or below this counts as low."
                >
                  <Form.Control type="number" min="0" step="1" value={values.reorderLevel} onChange={set('reorderLevel')} />
                </Field>
              </Col>
            </Row>
            <fieldset>
              <legend className="form-label fs-6">Status</legend>
              {PRODUCT_STATUSES.map((status) => (
                <Form.Check
                  key={status}
                  inline
                  type="radio"
                  id={`product-status-${status.toLowerCase()}`}
                  name="status"
                  label={status}
                  checked={values.status === status}
                  onChange={() => setValues((current) => ({ ...current, status }))}
                />
              ))}
            </fieldset>
          </Card.Body>
        </Card>

        <Card className="mb-3">
          <Card.Body>
            {product?.image_url && (
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={product.image_url}
                  alt={`Current photo of ${product.name}`}
                  className="rounded border"
                  style={{ maxHeight: 80 }}
                />
                <Form.Check
                  id="product-remove-image"
                  label="Remove the current image"
                  checked={removeImage}
                  disabled={image !== null}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                />
              </div>
            )}
            <Field
              id="product-image"
              label={product?.image_url ? 'Replace the image' : 'Image'}
              error={errors.image}
              help="PNG or JPEG, up to 1 MB."
            >
              <Form.Control
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => setImage((event.target as HTMLInputElement).files?.[0] ?? null)}
              />
            </Field>
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
          </Button>
          <LinkButton to={product ? `/products/${product.id}` : '/products'} variant="outline-secondary">
            Cancel
          </LinkButton>
        </div>
      </Form>
    </>
  );
}
