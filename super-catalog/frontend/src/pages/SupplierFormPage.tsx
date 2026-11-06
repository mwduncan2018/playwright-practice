import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Alert, Breadcrumb, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { ErrorMessage, Loading, NotFoundMessage } from '../components/Feedback';
import { Field } from '../components/Field';
import { LinkButton } from '../components/LinkButton';
import { useToast } from '../components/Toasts';
import type { Supplier } from '../types';
import { usePageTitle } from '../usePageTitle';

const COUNTRIES = [
  'Australia',
  'Brazil',
  'Canada',
  'France',
  'Germany',
  'India',
  'Japan',
  'Mexico',
  'United Kingdom',
  'United States',
];
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface Values {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
}

type Errors = Partial<Record<keyof Values, string>>;
type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Enter a name.';
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter an email address like name@example.com.';
  }
  return errors;
}

/** /suppliers/new and /suppliers/:id/edit. The key gives each supplier a fresh form. */
export default function SupplierFormPage() {
  const { id } = useParams();
  return <SupplierForm key={id ?? 'new'} supplierId={id === undefined ? undefined : Number(id)} />;
}

function SupplierForm({ supplierId }: { supplierId?: number }) {
  const editing = supplierId !== undefined;
  usePageTitle(editing ? 'Edit supplier' : 'New supplier');
  const api = useApi();
  const notify = useToast();
  const navigate = useNavigate();
  const existing = useLoad<Supplier>(editing ? `/api/suppliers/${supplierId}` : null);
  const [values, setValues] = useState<Values>({ name: '', contactName: '', email: '', phone: '', country: '' });
  const [filledFrom, setFilledFrom] = useState<number>();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const supplier = existing.data;
  if (supplier && filledFrom !== supplier.id) {
    setFilledFrom(supplier.id);
    setValues({
      name: supplier.name,
      contactName: supplier.contact_name,
      email: supplier.email,
      phone: supplier.phone,
      country: supplier.country,
    });
  }

  if (editing && existing.error) {
    return existing.error.status === 404 ? (
      <NotFoundMessage what="supplier" back="/suppliers" backLabel="Back to suppliers" />
    ) : (
      <ErrorMessage error={existing.error} onRetry={existing.reload} />
    );
  }
  if (editing && !supplier) return <Loading />;

  const set = (key: keyof Values) => (event: ChangeEvent<FormElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      const saved = await api<Supplier>(editing ? `/api/suppliers/${supplierId}` : '/api/suppliers', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          contact_name: values.contactName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          country: values.country,
        }),
      });
      notify(`${editing ? 'Saved changes to' : 'Created'} ${saved.name}.`);
      navigate(`/suppliers/${saved.id}`);
    } catch (failure) {
      const error = asApiError(failure);
      if (error.field === 'name') setErrors({ name: error.message });
      else setFormError(error.message);
      setSaving(false);
    }
  }

  const countries = values.country && !COUNTRIES.includes(values.country) ? [...COUNTRIES, values.country] : COUNTRIES;

  return (
    <>
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/suppliers' }}>
          Suppliers
        </Breadcrumb.Item>
        {supplier && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/suppliers/${supplier.id}` }}>
            {supplier.name}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>{editing ? 'Edit' : 'New supplier'}</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="h3 mb-3">{supplier ? `Edit ${supplier.name}` : 'New supplier'}</h1>
      {formError && <Alert variant="danger">{formError}</Alert>}

      <Form noValidate onSubmit={submit} aria-label={editing ? 'Edit supplier' : 'New supplier'} style={{ maxWidth: 720 }}>
        <Card className="mb-3">
          <Card.Body>
            <Field id="supplier-name" label="Name" error={errors.name}>
              <Form.Control value={values.name} onChange={set('name')} />
            </Field>
            <Row>
              <Col md={6}>
                <Field id="supplier-contact" label="Contact name" error={errors.contactName}>
                  <Form.Control value={values.contactName} onChange={set('contactName')} />
                </Field>
              </Col>
              <Col md={6}>
                <Field id="supplier-email" label="Email" error={errors.email}>
                  <Form.Control type="email" value={values.email} onChange={set('email')} />
                </Field>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Field id="supplier-phone" label="Phone" error={errors.phone}>
                  <Form.Control type="tel" value={values.phone} onChange={set('phone')} />
                </Field>
              </Col>
              <Col md={6}>
                <Field id="supplier-country" label="Country" error={errors.country}>
                  <Form.Select value={values.country} onChange={set('country')}>
                    <option value="">Not set</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Form.Select>
                </Field>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <div className="d-flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create supplier'}
          </Button>
          <LinkButton to={supplier ? `/suppliers/${supplier.id}` : '/suppliers'} variant="outline-secondary">
            Cancel
          </LinkButton>
        </div>
      </Form>
    </>
  );
}
