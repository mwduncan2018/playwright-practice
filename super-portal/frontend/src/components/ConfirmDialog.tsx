import { type ReactNode, useId } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';

interface Props {
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
    <Modal show={show} onHide={onClose} aria-labelledby={titleId} centered>
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
        {error && (
          <Alert variant="danger" className="mt-3 mb-0">
            {error}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        {error ? (
          <Button variant="secondary" onClick={onClose}>
            OK
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              {dismissLabel}
            </Button>
            <Button variant="danger" onClick={onConfirm} disabled={busy}>
              {confirmLabel}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
