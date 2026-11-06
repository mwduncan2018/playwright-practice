import type { ReactNode } from 'react';

/**
 * One label and value in a <dl className="row">. A value has no role or label of its own, so it
 * carries a test ID such as "product-price".
 */
export function Detail({ label, testId, children }: { label: string; testId: string; children: ReactNode }) {
  return (
    <>
      <dt className="col-sm-4 text-body-secondary fw-normal">{label}</dt>
      <dd className="col-sm-8" data-testid={testId}>
        {children}
      </dd>
    </>
  );
}
