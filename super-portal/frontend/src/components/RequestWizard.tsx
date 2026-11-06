import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { asApiError, useApi } from '../api';
import { ACCESS_LEVELS, DELIVERY_METHODS, EQUIPMENT_ITEMS, LICENSES, PRIORITIES, SOFTWARE, SYSTEMS, labelFor } from '../choices';
import { localDate } from '../format';
import type { Priority, RequestSummary, RequestType } from '../types';
import { Field } from './Field';
import { RadioGroup } from './RadioGroup';
import { type ReviewRow, ReviewSection } from './ReviewSection';
import { type WizardStep, WizardDialog } from './WizardDialog';

interface Values {
  item: string;
  quantity: string;
  delivery: string;
  address: string;
  software: string;
  license: string;
  seats: string;
  system: string;
  level: string;
  securityReason: string;
  trainingCompleted: boolean;
  priority: Priority;
  neededBy: string;
  reason: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const TITLES: Record<RequestType, string> = {
  Equipment: 'Request equipment',
  Software: 'Request software',
  Access: 'Request access',
};

function emptyValues(priority: Priority): Values {
  return {
    item: '',
    quantity: '1',
    delivery: '',
    address: '',
    software: '',
    license: '',
    seats: '1',
    system: '',
    level: '',
    securityReason: '',
    trainingCompleted: false,
    priority,
    neededBy: '',
    reason: '',
  };
}

function between(text: string, min: number, max: number): boolean {
  return /^\d+$/.test(text.trim()) && Number(text) >= min && Number(text) <= max;
}

interface Props {
  type: RequestType;
  show: boolean;
  /** From the user's settings. */
  defaultPriority: Priority;
  onClose(): void;
}

/**
 * The wizard for a new request. Each type has its own steps, then everyone picks a priority and
 * gives a reason, then reviews. Administrator access adds a Security review step.
 */
export function RequestWizard({ type, show, defaultPriority, onClose }: Props) {
  const api = useApi();
  const navigate = useNavigate();
  const [values, setValues] = useState<Values>(() => emptyValues(defaultPriority));
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [created, setCreated] = useState<RequestSummary>();

  // Changing a field clears its error; the rest wait for the next Next.
  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function check(found: Errors): boolean {
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  function reset() {
    setValues(emptyValues(defaultPriority));
    setErrors({});
    setStep(0);
    setError(undefined);
    setCreated(undefined);
  }

  const steps: WizardStep[] = [];
  const review: Record<string, ReviewRow[]> = {};

  if (type === 'Equipment') {
    steps.push(
      {
        key: 'equipment',
        title: 'Equipment',
        content: (
          <Row>
            <Col md={8}>
              <Field id="wizard-item" label="Item" error={errors.item}>
                <Form.Select value={values.item} onChange={(event) => set('item', event.target.value)}>
                  <option value="">Choose an item</option>
                  {EQUIPMENT_ITEMS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Form.Select>
              </Field>
            </Col>
            <Col md={4}>
              <Field id="wizard-quantity" label="Quantity" error={errors.quantity} help="From 1 to 10.">
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={values.quantity}
                  onChange={(event) => set('quantity', event.target.value)}
                />
              </Field>
            </Col>
          </Row>
        ),
        validate: () =>
          check({
            ...(values.item ? {} : { item: 'Choose an item.' }),
            ...(between(values.quantity, 1, 10) ? {} : { quantity: 'Enter a quantity from 1 to 10.' }),
          }),
      },
      {
        key: 'delivery',
        title: 'Delivery',
        content: (
          <>
            <RadioGroup
              name="delivery"
              legend="How do you want to get it?"
              choices={DELIVERY_METHODS}
              value={values.delivery}
              error={errors.delivery}
              onChange={(value) => set('delivery', value)}
            />
            {values.delivery === 'Ship' && (
              <Field id="wizard-address" label="Delivery address" error={errors.address} help="Street, city, state and ZIP code.">
                <Form.Control as="textarea" rows={2} value={values.address} onChange={(event) => set('address', event.target.value)} />
              </Field>
            )}
          </>
        ),
        validate: () =>
          check({
            ...(values.delivery ? {} : { delivery: 'Choose how you want to get it.' }),
            ...(values.delivery === 'Ship' && values.address.trim().length < 10
              ? { address: 'Enter the full delivery address.' }
              : {}),
          }),
      },
    );
    review.equipment = [
      ['Item', values.item],
      ['Quantity', values.quantity],
    ];
    review.delivery = [['Delivery', labelFor(DELIVERY_METHODS, values.delivery)]];
    if (values.delivery === 'Ship') review.delivery.push(['Address', values.address.trim()]);
  }

  if (type === 'Software') {
    steps.push(
      {
        key: 'software',
        title: 'Software',
        content: (
          <Field id="wizard-software" label="Software" error={errors.software}>
            <Form.Select value={values.software} onChange={(event) => set('software', event.target.value)}>
              <option value="">Choose the software</option>
              {SOFTWARE.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </Form.Select>
          </Field>
        ),
        validate: () => check(values.software ? {} : { software: 'Choose the software.' }),
      },
      {
        key: 'license',
        title: 'License',
        content: (
          <>
            <RadioGroup
              name="license"
              legend="License length"
              choices={LICENSES}
              value={values.license}
              error={errors.license}
              onChange={(value) => set('license', value)}
            />
            <Field id="wizard-seats" label="Seats" error={errors.seats} help="How many people will use it, from 1 to 50.">
              <Form.Control
                type="number"
                min="1"
                max="50"
                value={values.seats}
                onChange={(event) => set('seats', event.target.value)}
                style={{ maxWidth: 160 }}
              />
            </Field>
          </>
        ),
        validate: () =>
          check({
            ...(values.license ? {} : { license: 'Choose a license length.' }),
            ...(between(values.seats, 1, 50) ? {} : { seats: 'Enter a number of seats from 1 to 50.' }),
          }),
      },
    );
    review.software = [['Software', values.software]];
    review.license = [
      ['License length', values.license],
      ['Seats', values.seats],
    ];
  }

  if (type === 'Access') {
    steps.push({
      key: 'access',
      title: 'System and access',
      content: (
        <>
          <Field id="wizard-system" label="System" error={errors.system}>
            <Form.Select value={values.system} onChange={(event) => set('system', event.target.value)}>
              <option value="">Choose a system</option>
              {SYSTEMS.map((system) => (
                <option key={system}>{system}</option>
              ))}
            </Form.Select>
          </Field>
          <RadioGroup
            name="level"
            legend="Access level"
            choices={ACCESS_LEVELS}
            value={values.level}
            error={errors.level}
            help="Administrator access adds a security review step."
            onChange={(value) => set('level', value)}
          />
        </>
      ),
      validate: () =>
        check({
          ...(values.system ? {} : { system: 'Choose a system.' }),
          ...(values.level ? {} : { level: 'Choose an access level.' }),
        }),
    });
    review.access = [
      ['System', values.system],
      ['Access level', values.level],
    ];
    if (values.level === 'Administrator') {
      steps.push({
        key: 'security',
        title: 'Security review',
        content: (
          <>
            <Field
              id="wizard-security-reason"
              label="Why do you need administrator access?"
              error={errors.securityReason}
              help="At least 20 characters."
            >
              <Form.Control
                as="textarea"
                rows={3}
                value={values.securityReason}
                onChange={(event) => set('securityReason', event.target.value)}
              />
            </Field>
            <Form.Check
              id="wizard-training"
              label="I've completed this year's security training."
              checked={values.trainingCompleted}
              isInvalid={Boolean(errors.trainingCompleted)}
              aria-invalid={errors.trainingCompleted ? true : undefined}
              aria-errormessage={errors.trainingCompleted ? 'wizard-training-error' : undefined}
              onChange={(event) => set('trainingCompleted', event.target.checked)}
            />
            {errors.trainingCompleted && (
              <div id="wizard-training-error" className="invalid-feedback d-block">
                {errors.trainingCompleted}
              </div>
            )}
          </>
        ),
        validate: () =>
          check({
            ...(values.securityReason.trim().length >= 20
              ? {}
              : { securityReason: 'Explain in at least 20 characters why you need administrator access.' }),
            ...(values.trainingCompleted ? {} : { trainingCompleted: "Confirm that you've completed security training." }),
          }),
      });
      review.security = [
        ['Reason for administrator access', values.securityReason.trim()],
        ['Security training', values.trainingCompleted ? 'Completed' : 'Not completed'],
      ];
    }
  }

  steps.push({
    key: 'details',
    title: 'Priority and reason',
    content: (
      <>
        <RadioGroup
          name="priority"
          legend="Priority"
          choices={PRIORITIES}
          value={values.priority}
          inline
          onChange={(value) => set('priority', value as Priority)}
        />
        <Field id="wizard-needed-by" label="Needed by (optional)" error={errors.neededBy}>
          <Form.Control
            type="date"
            min={localDate()}
            value={values.neededBy}
            onChange={(event) => set('neededBy', event.target.value)}
            style={{ maxWidth: 220 }}
          />
        </Field>
        <Field id="wizard-reason" label="Why do you need this?" error={errors.reason} help="At least 10 characters.">
          <Form.Control as="textarea" rows={3} value={values.reason} onChange={(event) => set('reason', event.target.value)} />
        </Field>
      </>
    ),
    validate: () =>
      check({
        ...(values.neededBy && values.neededBy < localDate() ? { neededBy: 'Choose today or a later date.' } : {}),
        ...(values.reason.trim().length >= 10 ? {} : { reason: 'Tell us why you need this, in at least 10 characters.' }),
      }),
  });
  review.details = [
    ['Priority', values.priority],
    ['Needed by', values.neededBy || 'No date'],
    ['Reason', values.reason.trim()],
  ];

  const answered = steps.slice();
  steps.push({
    key: 'review',
    title: 'Review',
    content: (
      <>
        <p>Check your request, then submit it. An admin will approve or reject it.</p>
        {answered.map((item, index) => (
          <ReviewSection key={item.key} title={item.title} rows={review[item.key]} onEdit={() => setStep(index)} />
        ))}
      </>
    ),
  });

  function details() {
    if (type === 'Equipment') {
      return {
        type,
        item: values.item,
        quantity: Number(values.quantity),
        delivery: values.delivery,
        address: values.delivery === 'Ship' ? values.address.trim() : '',
      };
    }
    if (type === 'Software') {
      return { type, software: values.software, license: values.license, seats: Number(values.seats) };
    }
    const administrator = values.level === 'Administrator';
    return {
      type,
      system: values.system,
      level: values.level,
      security_justification: administrator ? values.securityReason.trim() : '',
      training_completed: administrator && values.trainingCompleted,
    };
  }

  async function submit() {
    setSubmitting(true);
    setError(undefined);
    try {
      const request = await api<RequestSummary>('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          details: details(),
          priority: values.priority,
          needed_by: values.neededBy || null,
          justification: values.reason.trim(),
        }),
      });
      setCreated(request);
    } catch (failure) {
      setError(asApiError(failure).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WizardDialog
      show={show}
      title={TITLES[type]}
      itemName="request"
      steps={steps}
      step={step}
      onStep={setStep}
      dirty={JSON.stringify(values) !== JSON.stringify(emptyValues(defaultPriority))}
      submitLabel="Submit request"
      submitting={submitting}
      error={error}
      onSubmit={submit}
      onClose={onClose}
      onEnter={reset}
      done={
        created && (
          <div className="text-center py-3">
            <p className="display-6 text-success-emphasis mb-2" aria-hidden="true">
              ✓
            </p>
            <h2 className="h4">Request submitted</h2>
            <p>
              Your request number is <strong data-testid="new-request-number">{created.number}</strong>.
              <br />
              An admin will review it, and you can follow it on My requests.
            </p>
            <Button
              onClick={() => {
                onClose();
                navigate(`/requests/${created.number}`);
              }}
            >
              View request
            </Button>
          </div>
        )
      }
    />
  );
}
