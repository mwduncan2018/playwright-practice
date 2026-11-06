import { Form } from 'react-bootstrap';

import type { Choice } from '../choices';

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

/** Radio buttons in a fieldset, so the group is named by its legend. */
export function RadioGroup({ name, legend, choices, value, error, help, inline, onChange }: Props) {
  const describedBy = [error && `${name}-error`, help && `${name}-help`].filter(Boolean).join(' ') || undefined;
  return (
    <fieldset className="mb-3" aria-describedby={describedBy}>
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
          />
        );
      })}
      {help && (
        <Form.Text id={`${name}-help`} muted className="d-block">
          {help}
        </Form.Text>
      )}
      {error && (
        <div id={`${name}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </fieldset>
  );
}
