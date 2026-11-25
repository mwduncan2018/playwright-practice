import { cloneElement, type ReactElement } from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  id: string;
  label: string;
  error?: string;
  help?: string;
  children: ReactElement<{
    isInvalid?: boolean;
    'aria-invalid'?: boolean;
    'aria-errormessage'?: string;
    'aria-describedby'?: string;
  }>;
}

/**
 * A labelled form control. controlId ties the label to the control. An error marks the control
 * invalid and is its error message (aria-errormessage); help text is its description. The error and
 * help text carry test IDs made from the field's ID, such as "wizard-item-error"; the control itself
 * gets its test ID where it's written.
 */
export function Field({ id, label, error, help, children }: Props) {
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, help && `${id}-help`].filter(Boolean).join(' ') || undefined;
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{label}</Form.Label>
      {cloneElement(children, {
        isInvalid: Boolean(error),
        'aria-invalid': error ? true : undefined,
        'aria-errormessage': error ? errorId : undefined,
        'aria-describedby': describedBy,
      })}
      <Form.Control.Feedback type="invalid" id={errorId} data-testid={errorId}>
        {error}
      </Form.Control.Feedback>
      {help && (
        <Form.Text id={`${id}-help`} data-testid={`${id}-help`} muted>
          {help}
        </Form.Text>
      )}
    </Form.Group>
  );
}
