import { Fragment, useId } from 'react';
import { Button } from 'react-bootstrap';

export type ReviewRow = [label: string, value: string];

/** One step's answers on a wizard's Review step, with an Edit button that goes back to that step. */
export function ReviewSection({ title, rows, onEdit }: { title: string; rows: ReviewRow[]; onEdit(): void }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="border rounded p-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 id={headingId} className="h6 mb-0">
          {title}
        </h3>
        <Button variant="link" size="sm" className="p-0" onClick={onEdit} aria-label={`Edit ${title}`}>
          Edit
        </Button>
      </div>
      <dl className="row mb-0">
        {rows.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="col-sm-4 fw-normal text-body-secondary">{label}</dt>
            <dd className="col-sm-8 mb-1">{value}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}
