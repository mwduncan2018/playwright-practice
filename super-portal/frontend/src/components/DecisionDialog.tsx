import { type FormEvent, useId, useState } from 'react';
import { Alert, Button, CloseButton, Form, Modal } from 'react-bootstrap';

import { asApiError, useApi } from '../api';
import type { RequestDetail, RequestSummary } from '../types';
import { Field } from './Field';

interface Props {
  show: boolean;
  request?: RequestSummary;
  decision: 'approve' | 'reject';
  onClose(): void;
  onDecided(updated: RequestDetail): void;
}

/**
 * Approve with an optional note, or reject with a reason the requester will see. Its test ID is
 * "approve-dialog" or "reject-dialog", and its parts' test IDs start with that.
 */
export function DecisionDialog({ show, request, decision, onClose, onDecided }: Props) {
  const titleId = useId();
  const api = useApi();
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const approving = decision === 'approve';
  const testId = `${decision}-dialog`;

  function reset() {
    setText('');
    setFieldError(undefined);
    setError(undefined);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!request) return;
    if (!approving && text.trim().length < 5) {
      setFieldError('Tell the requester why, in at least 5 characters.');
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const updated = await api<RequestDetail>(`/api/requests/${request.number}/${decision}`, {
        method: 'POST',
        body: JSON.stringify(approving ? { note: text.trim() } : { reason: text.trim() }),
      });
      onDecided(updated);
    } catch (failure) {
      setError(asApiError(failure).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show={show} onHide={onClose} onEnter={reset} aria-labelledby={titleId} data-testid={testId}>
      <Form noValidate onSubmit={submit} data-testid={`${testId}-form`}>
        {/* The X written out, as Modal.Header would render it, so it can carry a test ID. */}
        <Modal.Header>
          <Modal.Title id={titleId} data-testid={`${testId}-title`}>
            {approving ? 'Approve' : 'Reject'} {request?.number}
          </Modal.Title>
          <CloseButton aria-label="Close" onClick={onClose} data-testid={`${testId}-close-button`} />
        </Modal.Header>
        <Modal.Body>
          {request && (
            <p data-testid={`${testId}-request-text`}>
              <strong>{request.title}</strong> for {request.requester_name}
            </p>
          )}
          {error && (
            <Alert variant="danger" data-testid={`${testId}-error-alert`}>
              {error}
            </Alert>
          )}
          <Field
            id="decision-text"
            label={approving ? 'Note for the requester (optional)' : 'Reason'}
            error={fieldError}
            help={approving ? undefined : 'The requester sees this. At least 5 characters.'}
          >
            <Form.Control
              as="textarea"
              rows={3}
              value={text}
              onChange={(event) => setText(event.target.value)}
              data-testid="decision-text-textarea"
            />
          </Field>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} data-testid={`${testId}-cancel-button`}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={approving ? 'success' : 'danger'}
            disabled={busy}
            data-testid={`${testId}-submit-button`}
          >
            {approving ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
