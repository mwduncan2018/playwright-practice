import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { asApiError, useApi } from '../api';
import { AUDIENCES, labelFor } from '../choices';
import { localDate } from '../format';
import type { Announcement } from '../types';
import { Field } from './Field';
import { RadioGroup } from './RadioGroup';
import { ReviewSection } from './ReviewSection';
import { type WizardStep, WizardDialog } from './WizardDialog';

interface Values {
  title: string;
  body: string;
  audience: string;
  when: string;
  publishOn: string;
  pinned: boolean;
}

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { title: '', body: '', audience: '', when: 'now', publishOn: '', pinned: false };
const WHEN_CHOICES = [
  { value: 'now', label: 'Publish now' },
  { value: 'later', label: 'Schedule for a later date' },
];

/** The admins' wizard for a new announcement: message, audience, publishing, review. */
export function AnnouncementWizard({ show, onClose, onCreated }: { show: boolean; onClose(): void; onCreated(): void }) {
  const api = useApi();
  const navigate = useNavigate();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [created, setCreated] = useState<Announcement>();
  const later = values.when === 'later';

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
    setValues(EMPTY);
    setErrors({});
    setStep(0);
    setError(undefined);
    setCreated(undefined);
  }

  const steps: WizardStep[] = [
    {
      key: 'message',
      title: 'Message',
      content: (
        <>
          <Field id="announcement-title" label="Title" error={errors.title}>
            <Form.Control
              value={values.title}
              maxLength={120}
              onChange={(event) => set('title', event.target.value)}
              data-testid="announcement-title-input"
            />
          </Field>
          <Field id="announcement-body" label="Message" error={errors.body} help="Up to 2,000 characters. Start a new paragraph on a new line.">
            <Form.Control
              as="textarea"
              rows={5}
              value={values.body}
              maxLength={2000}
              onChange={(event) => set('body', event.target.value)}
              data-testid="announcement-body-textarea"
            />
          </Field>
        </>
      ),
      validate: () =>
        check({
          ...(values.title.trim() ? {} : { title: 'Enter a title.' }),
          ...(values.body.trim() ? {} : { body: 'Enter the message.' }),
        }),
    },
    {
      key: 'audience',
      title: 'Audience',
      content: (
        <RadioGroup
          name="audience"
          legend="Who should see it?"
          choices={AUDIENCES}
          value={values.audience}
          error={errors.audience}
          onChange={(value) => set('audience', value)}
        />
      ),
      validate: () => check(values.audience ? {} : { audience: 'Choose who should see it.' }),
    },
    {
      key: 'publishing',
      title: 'Publishing',
      content: (
        <>
          <RadioGroup
            name="when"
            legend="When should it appear?"
            choices={WHEN_CHOICES}
            value={values.when}
            onChange={(value) => set('when', value)}
          />
          {later && (
            <Field id="announcement-publish-on" label="Publish on" error={errors.publishOn} help="It appears at 09:00 UTC that day.">
              <Form.Control
                type="date"
                min={localDate(1)}
                value={values.publishOn}
                onChange={(event) => set('publishOn', event.target.value)}
                style={{ maxWidth: 220 }}
                data-testid="announcement-publish-on-input"
              />
            </Field>
          )}
          <Form.Check
            id="announcement-pinned"
            label="Pin it to the top of Home and Announcements"
            checked={values.pinned}
            onChange={(event) => set('pinned', event.target.checked)}
            data-testid="announcement-pinned-checkbox"
          />
        </>
      ),
      validate: () =>
        check(later && !(values.publishOn > localDate()) ? { publishOn: 'Choose a date after today.' } : {}),
    },
  ];
  const answered = steps.slice();
  const rows = {
    message: [
      ['Title', values.title.trim()],
      ['Message', values.body.trim()],
    ],
    audience: [['Who sees it', labelFor(AUDIENCES, values.audience)]],
    publishing: [
      ['When', later ? `${values.publishOn} at 09:00 UTC` : 'Now'],
      ['Pinned', values.pinned ? 'Yes' : 'No'],
    ],
  } as Record<string, [string, string][]>;
  steps.push({
    key: 'review',
    title: 'Review',
    content: (
      <>
        <p data-testid="announcement-wizard-review-text">Check the announcement, then {later ? 'schedule' : 'publish'} it.</p>
        {answered.map((item, index) => (
          <ReviewSection key={item.key} title={item.title} rows={rows[item.key]} onEdit={() => setStep(index)} />
        ))}
      </>
    ),
  });

  async function submit() {
    setSubmitting(true);
    setError(undefined);
    try {
      const announcement = await api<Announcement>('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: values.title.trim(),
          body: values.body.trim(),
          audience: values.audience,
          pinned: values.pinned,
          publish_on: later ? values.publishOn : null,
        }),
      });
      setCreated(announcement);
      onCreated();
    } catch (failure) {
      setError(asApiError(failure).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WizardDialog
      testId="announcement-wizard"
      show={show}
      title="New announcement"
      itemName="announcement"
      steps={steps}
      step={step}
      onStep={setStep}
      dirty={JSON.stringify(values) !== JSON.stringify(EMPTY)}
      submitLabel={later ? 'Schedule announcement' : 'Publish announcement'}
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
            <h2 className="h4" data-testid="announcement-wizard-created-heading">
              {created.scheduled ? 'Announcement scheduled' : 'Announcement published'}
            </h2>
            <p data-testid="announcement-wizard-created-text">
              {created.scheduled
                ? `“${created.title}” appears on ${values.publishOn} at 09:00 UTC.`
                : `“${created.title}” is live now.`}
            </p>
            <Button
              onClick={() => {
                onClose();
                navigate(`/announcements/${created.id}`);
              }}
              data-testid="announcement-wizard-view-announcement-button"
            >
              View announcement
            </Button>
          </div>
        )
      }
    />
  );
}
