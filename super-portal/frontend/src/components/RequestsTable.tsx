import type { ReactNode } from 'react';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';

import { formatDate } from '../format';
import { testIdPart } from '../testIds';
import type { RequestSummary } from '../types';
import { PriorityBadge, RequestStatusBadge } from './Feedback';

export type RequestColumnKey =
  | 'number'
  | 'title'
  | 'type'
  | 'requester'
  | 'priority'
  | 'status'
  | 'submitted'
  | 'neededBy'
  | 'updated'
  | 'decidedBy';

export interface RequestColumn {
  key: RequestColumnKey;
  label: string;
  className?: string;
  render(request: RequestSummary): ReactNode;
}

/** Every column a requests table can show, in the default order. */
export const REQUEST_COLUMNS: RequestColumn[] = [
  {
    key: 'number',
    label: 'Number',
    className: 'text-nowrap',
    render: (request) => (
      <Link to={`/requests/${request.number}`} data-testid="request-number-link">
        {request.number}
      </Link>
    ),
  },
  { key: 'title', label: 'Title', render: (request) => request.title },
  { key: 'type', label: 'Type', render: (request) => request.type },
  { key: 'requester', label: 'Requester', className: 'text-nowrap', render: (request) => request.requester_name },
  { key: 'priority', label: 'Priority', render: (request) => <PriorityBadge priority={request.priority} /> },
  { key: 'status', label: 'Status', render: (request) => <RequestStatusBadge status={request.status} /> },
  {
    key: 'submitted',
    label: 'Submitted',
    className: 'text-nowrap',
    render: (request) => formatDate(request.created_at),
  },
  { key: 'neededBy', label: 'Needed by', className: 'text-nowrap', render: (request) => request.needed_by ?? '—' },
  { key: 'updated', label: 'Updated', className: 'text-nowrap', render: (request) => formatDate(request.updated_at) },
  { key: 'decidedBy', label: 'Decided by', className: 'text-nowrap', render: (request) => request.decided_by ?? '—' },
];

/** The columns for a person's own requests, where Requester would always be the same. */
export const OWN_REQUEST_COLUMNS: RequestColumnKey[] = ['number', 'title', 'type', 'priority', 'status', 'submitted'];

interface Props {
  /** The table's test ID, such as "my-requests-table". Its column headings' test IDs start with it. */
  testId: string;
  requests: RequestSummary[];
  /** The table's accessible name, for example "My requests". */
  label: string;
  /** The columns to show, in order. */
  columns?: RequestColumnKey[];
}

/**
 * Requests in a table. Each row carries a test ID with its request number, such as
 * "request-row-REQ-1001", and each cell in it a test ID for its column, such as "status-cell".
 */
export function RequestsTable({ testId, requests, label, columns = OWN_REQUEST_COLUMNS }: Props) {
  const shown = columns.flatMap((key) => REQUEST_COLUMNS.filter((column) => column.key === key));
  return (
    <Table striped hover responsive className="align-middle" aria-label={label} data-testid={testId}>
      <thead>
        <tr data-testid={`${testId}-header-row`}>
          {shown.map((column) => (
            <th key={column.key} scope="col" data-testid={`${testId}-${testIdPart(column.key)}-header`}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.number} data-testid={`request-row-${request.number}`}>
            {shown.map((column) => (
              <td key={column.key} className={column.className} data-testid={`${testIdPart(column.key)}-cell`}>
                {column.render(request)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
