import { type ReactNode, useId } from 'react';
import { Alert, Button, CloseButton, Modal } from 'react-bootstrap';

interface Props {
  /** The dialog's test ID, such as "cancel-request-dialog". Its parts' test IDs start with it. */
  testId: string;
  show: boolean;
  title: string;
  confirmLabel: string;
  /** The button that backs out. "Cancel" unless that would be confusing, as in "Cancel request". */
  dismissLabel?: string;
  busy?: boolean;
  /** The server's reason for refusing. Replaces the buttons with OK. */
  error?: string;
  onConfirm(): void;
  onClose(): void;
  children: ReactNode;
}

/** Asks before something that can't be undone. */
export function ConfirmDialog({
  testId,
  show,
  title,
  confirmLabel,
  dismissLabel = 'Cancel',
  busy,
  error,
  onConfirm,
  onClose,
  children,
}: Props) {
  const titleId = useId();
  return (
    <Modal show={show} onHide={onClose} aria-labelledby={titleId} centered data-testid={testId}>
      {/* The X written out, as Modal.Header would render it, so it can carry a test ID. */}
      <Modal.Header>
        <Modal.Title id={titleId} data-testid={`${testId}-title`}>
          {title}
        </Modal.Title>
        <CloseButton aria-label="Close" onClick={onClose} data-testid={`${testId}-close-button`} />
      </Modal.Header>
      <Modal.Body>
        <div data-testid={`${testId}-message-text`}>{children}</div>
        {error && (
          <Alert variant="danger" className="mt-3 mb-0" data-testid={`${testId}-error-alert`}>
            {error}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        {error ? (
          <Button variant="secondary" onClick={onClose} data-testid={`${testId}-ok-button`}>
            OK
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={busy} data-testid={`${testId}-dismiss-button`}>
              {dismissLabel}
            </Button>
            <Button variant="danger" onClick={onConfirm} disabled={busy} data-testid={`${testId}-confirm-button`}>
              {confirmLabel}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
