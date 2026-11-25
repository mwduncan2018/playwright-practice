import { type ReactNode, useId, useState } from 'react';
import { Alert, Button, CloseButton, Modal } from 'react-bootstrap';

export interface WizardStep {
  key: string;
  title: string;
  content: ReactNode;
  /** Checks the step and shows its errors. Returns true when it's fine to go on. */
  validate?(): boolean;
}

interface Props {
  /** The dialog's test ID, such as "equipment-wizard". Its parts' test IDs start with it. */
  testId: string;
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
  testId,
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
      data-testid={testId}
    >
      {/* The X written out, as Modal.Header would render it, so it can carry a test ID. */}
      <Modal.Header>
        <Modal.Title id={titleId} data-testid={`${testId}-title`}>
          {title}
        </Modal.Title>
        <CloseButton aria-label="Close" onClick={requestClose} data-testid={`${testId}-close-button`} />
      </Modal.Header>
      {done ? (
        <>
          <Modal.Body>{done}</Modal.Body>
          <Modal.Footer>
            {/* "Done" rather than "Close", so it doesn't share a name with the X. */}
            <Button variant="secondary" onClick={onClose} data-testid={`${testId}-done-button`}>
              Done
            </Button>
          </Modal.Footer>
        </>
      ) : confirmingDiscard ? (
        <>
          <Modal.Body>
            <Alert variant="warning" className="mb-0" data-testid={`${testId}-discard-alert`}>
              <Alert.Heading as="h2" className="h5" data-testid={`${testId}-discard-heading`}>
                Discard this {itemName}?
              </Alert.Heading>
              <p className="mb-0" data-testid={`${testId}-discard-text`}>
                What you've entered so far will be lost.
              </p>
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setConfirmingDiscard(false)}
              data-testid={`${testId}-keep-editing-button`}
            >
              Keep editing
            </Button>
            <Button variant="danger" onClick={onClose} data-testid={`${testId}-discard-button`}>
              Discard
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <>
          <Modal.Body>
            <p className="small text-body-secondary mb-2" data-testid={`${testId}-progress-text`}>
              Step {index + 1} of {steps.length}
            </p>
            <ol
              className="wizard-steps list-unstyled d-flex flex-wrap row-gap-2 mb-4"
              aria-label="Steps"
              data-testid={`${testId}-steps-list`}
            >
              {steps.map((item, i) => (
                <li
                  key={item.key}
                  className={i < index ? 'done' : undefined}
                  aria-current={i === index ? 'step' : undefined}
                  data-testid={`${testId}-${item.key}-step-item`}
                >
                  <span className="wizard-step-number" aria-hidden="true">
                    {i < index ? '✓' : i + 1}
                  </span>
                  {item.title}
                  {i < index && <span className="visually-hidden"> (done)</span>}
                </li>
              ))}
            </ol>
            {error && (
              <Alert variant="danger" data-testid={`${testId}-error-alert`}>
                {error}
              </Alert>
            )}
            {/* A plain container: naming it after the step would clash with a field of the same name. */}
            <div>
              <h2 className="h5 mb-3" data-testid={`${testId}-step-heading`}>
                {current.title}
              </h2>
              {current.content}
            </div>
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            <Button variant="outline-secondary" onClick={requestClose} data-testid={`${testId}-cancel-button`}>
              Cancel
            </Button>
            <div className="d-flex gap-2">
              {index > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => onStep(index - 1)}
                  disabled={submitting}
                  data-testid={`${testId}-back-button`}
                >
                  Back
                </Button>
              )}
              {last ? (
                <Button onClick={onSubmit} disabled={submitting} data-testid={`${testId}-submit-button`}>
                  {submitting ? 'Submitting…' : submitLabel}
                </Button>
              ) : (
                <Button onClick={next} data-testid={`${testId}-next-button`}>
                  Next
                </Button>
              )}
            </div>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
