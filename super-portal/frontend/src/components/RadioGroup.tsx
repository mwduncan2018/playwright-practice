import { Form } from 'react-bootstrap';

import type { Choice } from '../choices';
import { testIdPart } from '../testIds';

interface Props {
  name: string;
  legend: string;
  choices: (Choice | string)[];
  value: string;
  error?: string;
  help?: string;
  inline?: boolean;
  onChange(value: string): void;
}

/**
 * Radio buttons in a fieldset, so the group is named by its legend. Test IDs come from the name and
 * each choice's value: "delivery-radio-group", "delivery-ship-radio", "delivery-error".
 */
export function RadioGroup({ name, legend, choices, value, error, help, inline, onChange }: Props) {
  const describedBy = [error && `${name}-error`, help && `${name}-help`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset className="mb-3" aria-describedby={describedBy} data-testid={`${name}-radio-group`}>
      <legend className="form-label fs-6 mb-2">{legend}</legend>
      {choices.map((choice) => {
        const { value: choiceValue, label } = typeof choice === 'string' ? { value: choice, label: choice } : choice;
        return (
          <Form.Check
            key={choiceValue}
            type="radio"
            inline={inline}
            id={`${name}-${choiceValue.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            name={name}
            label={label}
            checked={value === choiceValue}
            isInvalid={Boolean(error)}
            onChange={() => onChange(choiceValue)}
            data-testid={`${name}-${testIdPart(choiceValue)}-radio`}
          />
        );
      })}
      {help && (
        <Form.Text id={`${name}-help`} data-testid={`${name}-help`} muted className="d-block">
          {help}
        </Form.Text>
      )}
      {error && (
        <div id={`${name}-error`} data-testid={`${name}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </fieldset>
  );
}
