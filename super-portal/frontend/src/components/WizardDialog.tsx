import { type ReactNode, useId, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';

export interface WizardStep {
  key: string;
  title: string;
  content: ReactNode;
  /** Checks the step and shows its errors. Returns true when it's fine to go on. */
  validate?(): boolean;
}

interface Props {
  show: boolean;
  title: string;
  /** What's being made, for "Discard this request?". */
  itemName: string;
  steps: WizardStep[];
  step: number;
  onStep(index: number): void;
  /** Whether anything has been entered, so closing should ask first. */
  dirty: boolean;
  submitLabel: string;
  submitting: boolean;
  error?: string;
  /** Once set, shown in place of the steps: the item has been created. */
  done?: ReactNode;
  onSubmit(): void;
  onClose(): void;
  /** Runs as the dialog opens, to start from a clean form. */
  onEnter?(): void;
}

/**
 * A dialog that walks through steps. Next checks the current step, Back keeps what was entered,
 * and closing with unsaved entries asks first. The last step submits.
 */
export function WizardDialog({
  show,
  title,
  itemName,
  steps,
  step,
  onStep,
  dirty,
  submitLabel,
  submitting,
  error,
  done,
  onSubmit,
  onClose,
  onEnter,
}: Props) {
  const titleId = useId();
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const index = Math.min(step, steps.length - 1);
  const current = steps[index];
  const last = index === steps.length - 1;

  function requestClose() {
    if (done || !dirty) onClose();
    else setConfirmingDiscard(true);
  }

  function next() {
    if (current.validate && !current.validate()) return;
    onStep(index + 1);
  }

  return (
    <Modal
      show={show}
      onHide={requestClose}
      onEnter={() => {
        setConfirmingDiscard(false);
        onEnter?.();
      }}
      backdrop="static"
      size="lg"
      aria-labelledby={titleId}
    >
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>{title}</Modal.Title>
      </Modal.Header>
      {done ? (
        <>
          <Modal.Body>{done}</Modal.Body>
          <Modal.Footer>
            {/* "Done" rather than "Close", so it doesn't share a name with the X. */}
            <Button variant="secondary" onClick={onClose}>
              Done
            </Button>
          </Modal.Footer>
        </>
      ) : confirmingDiscard ? (
        <>
          <Modal.Body>
            <Alert variant="warning" className="mb-0">
              <Alert.Heading as="h2" className="h5">
                Discard this {itemName}?
              </Alert.Heading>
              <p className="mb-0">What you've entered so far will be lost.</p>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setConfirmingDiscard(false)}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={onClose}>
              Discard
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <Modal.Body>
            <p className="small text-body-secondary mb-2">
              Step {index + 1} of {steps.length}
            </p>
            <ol className="wizard-steps list-unstyled d-flex flex-wrap row-gap-2 mb-4" aria-label="Steps">
              {steps.map((item, i) => (
                <li key={item.key} className={i < index ? 'done' : undefined} aria-current={i === index ? 'step' : undefined}>
                  <span className="wizard-step-number" aria-hidden="true">
                    {i < index ? '✓' : i + 1}
                  </span>
                  {item.title}
                  {i < index && <span className="visually-hidden"> (done)</span>}
                </li>
              ))}
            </ol>
            {error && <Alert variant="danger">{error}</Alert>}
            {/* A plain container: naming it after the step would clash with a field of the same name. */}
            <div>
              <h2 className="h5 mb-3">{current.title}</h2>
              {current.content}
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            <Button variant="outline-secondary" onClick={requestClose}>
              Cancel
            </Button>
            <div className="d-flex gap-2">
              {index > 0 && (
                <Button variant="secondary" onClick={() => onStep(index - 1)} disabled={submitting}>
                  Back
                </Button>
              )}
              {last ? (
                <Button onClick={onSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : submitLabel}
                </Button>
              ) : (
                <Button onClick={next}>Next</Button>
              )}
            </div>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
