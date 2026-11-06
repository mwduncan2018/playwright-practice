import { type FormEvent, useId, useState } from 'react';
import { Alert, Button, Form, Modal, Table } from 'react-bootstrap';
import { Link } from 'react-router';

import { asApiError, useApi, useLoad } from '../api';
import { useAuth } from '../auth';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorMessage, Loading } from '../components/Feedback';
import { Field } from '../components/Field';
import { useToast } from '../components/Toasts';
import { plural } from '../format';
import type { Category } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function CategoriesPage() {
  usePageTitle('Categories');
  const { user } = useAuth();
  const api = useApi();
  const notify = useToast();
  const { data, error, loading, reload } = useLoad<Category[]>('/api/categories');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category>();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<Category>();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();

  function openDialog(category?: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  function askToDelete(category: Category) {
    setTarget(category);
    setDeleteError(undefined);
    setConfirmOpen(true);
  }

  async function remove() {
    if (!target) return;
    setDeleting(true);
    try {
      await api(`/api/categories/${target.id}`, { method: 'DELETE' });
      notify(`Deleted the ${target.name} category.`);
      setConfirmOpen(false);
      reload();
    } catch (failure) {
      setDeleteError(asApiError(failure).message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h1 className="h3 mb-0">Categories</h1>
        {user.isAdmin && <Button onClick={() => openDialog()}>New category</Button>}
      </div>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <Table striped hover className="align-middle" aria-label="Categories">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col" className="text-end">
                Products
              </th>
              {user.isAdmin && (
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || <span className="text-body-secondary">None</span>}</td>
                <td className="text-end">
                  <Link
                    to={`/products?category_id=${category.id}`}
                    aria-label={`${plural(category.product_count, 'product')} in ${category.name}`}
                  >
                    {category.product_count}
                  </Link>
                </td>
                {user.isAdmin && (
                  <td className="text-end text-nowrap">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => openDialog(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => askToDelete(category)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <CategoryDialog
        show={dialogOpen}
        category={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={(saved) => {
          notify(editing ? `Saved changes to ${saved.name}.` : `Created the ${saved.name} category.`);
          setDialogOpen(false);
          reload();
        }}
      />
      <ConfirmDialog
        show={confirmOpen}
        title="Delete category"
        confirmLabel="Delete"
        busy={deleting}
        error={deleteError}
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      >
        Delete the <strong>{target?.name}</strong> category? This can't be undone.
      </ConfirmDialog>
    </>
  );
}

interface DialogProps {
  show: boolean;
  /** Leave out to create a category. */
  category?: Category;
  onClose(): void;
  onSaved(saved: Category): void;
}

function CategoryDialog({ show, category, onClose, onSaved }: DialogProps) {
  const titleId = useId();
  const api = useApi();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  // Start from the category, or empty, each time the dialog opens.
  function reset() {
    setName(category?.name ?? '');
    setDescription(category?.description ?? '');
    setNameError(undefined);
    setFormError(undefined);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError('Enter a name.');
      return;
    }
    setSaving(true);
    try {
      const saved = await api<Category>(category ? `/api/categories/${category.id}` : '/api/categories', {
        method: category ? 'PUT' : 'POST',
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      onSaved(saved);
    } catch (failure) {
      const error = asApiError(failure);
      if (error.field === 'name') setNameError(error.message);
      else setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} onEnter={reset} aria-labelledby={titleId}>
      <Form noValidate onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title id={titleId}>{category ? `Edit ${category.name}` : 'New category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          <Field id="category-name" label="Name" error={nameError}>
            <Form.Control value={name} maxLength={50} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field id="category-description" label="Description">
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              maxLength={200}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
