import { type FormEvent, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';

import { asApiError, useApi, useLoad } from '../api';
import { useAuth } from '../auth';
import { PRIORITIES } from '../choices';
import { Detail } from '../components/Detail';
import { ErrorMessage, Loading } from '../components/Feedback';
import { Field } from '../components/Field';
import { useToast } from '../components/Toasts';
import type { Priority, UserSettings } from '../types';
import { usePageTitle } from '../usePageTitle';

/** The signed-in user's account and their own settings, saved per user on the server. */
export default function SettingsPage() {
  usePageTitle('Settings');
  const { user, signOut, accountUrl } = useAuth();
  const api = useApi();
  const notify = useToast();
  const loaded = useLoad<UserSettings>('/api/settings');
  const [values, setValues] = useState<UserSettings>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  if (loaded.data && !values) setValues(loaded.data);

  function change<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setValues((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      setValues(await api<UserSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(values) }));
      notify('Settings saved.');
    } catch (failure) {
      setError(asApiError(failure).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="h3 mb-3">Settings</h1>
      <Row className="g-4">
        <Col lg={5}>
          <Card>
            <Card.Header as="h2" className="h6 py-3 mb-0">
              Your account
            </Card.Header>
            <Card.Body>
              <dl className="row mb-0">
                <Detail label="Name" testId="account-name">
                  {user.name}
                </Detail>
                <Detail label="Username" testId="account-username">
                  {user.username}
                </Detail>
                <Detail label="Email" testId="account-email">
                  {user.email || 'None'}
                </Detail>
                <Detail label="Roles" testId="account-roles">
                  {user.roles.map((role) => (
                    <Badge key={role} bg={role === 'admin' ? 'info' : 'secondary'} text={role === 'admin' ? 'dark' : undefined} className="me-1">
                      {role}
                    </Badge>
                  ))}
                </Detail>
              </dl>
            </Card.Body>
            <Card.Footer className="d-flex flex-wrap gap-2">
              <Button href={accountUrl} target="_blank" rel="noreferrer" variant="outline-secondary">
                Manage your account in Keycloak
              </Button>
              <Button variant="outline-danger" onClick={signOut}>
                Sign out
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        <Col lg={7}>
          {loaded.error && <ErrorMessage error={loaded.error} onRetry={loaded.reload} />}
          {!values && !loaded.error && <Loading />}
          {values && (
            <Form onSubmit={save} aria-label="Settings">
              <Card className="mb-3">
                <Card.Header as="h2" className="h6 py-3 mb-0">
                  Email notifications
                </Card.Header>
                <Card.Body>
                  <Form.Check
                    type="switch"
                    id="setting-decision"
                    className="mb-2"
                    label="Email me when my request is approved or rejected"
                    checked={values.email_on_decision}
                    onChange={(event) => change('email_on_decision', event.target.checked)}
                  />
                  <Form.Check
                    type="switch"
                    id="setting-comment"
                    className="mb-2"
                    label="Email me when someone comments on my request"
                    checked={values.email_on_comment}
                    onChange={(event) => change('email_on_comment', event.target.checked)}
                  />
                  <Form.Check
                    type="switch"
                    id="setting-weekly"
                    label="Send me a weekly summary"
                    checked={values.weekly_summary}
                    onChange={(event) => change('weekly_summary', event.target.checked)}
                  />
                </Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Header as="h2" className="h6 py-3 mb-0">
                  Requests
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Field id="setting-priority" label="Default priority for new requests">
                        <Form.Select
                          value={values.default_priority}
                          onChange={(event) => change('default_priority', event.target.value as Priority)}
                        >
                          {PRIORITIES.map((priority) => (
                            <option key={priority}>{priority}</option>
                          ))}
                        </Form.Select>
                      </Field>
                    </Col>
                    <Col md={6}>
                      <Field id="setting-page-size" label="Rows per page in request lists">
                        <Form.Select value={values.page_size} onChange={(event) => change('page_size', Number(event.target.value))}>
                          {[10, 25, 50].map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </Form.Select>
                      </Field>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save settings'}
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </>
  );
}
