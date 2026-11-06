import { Table } from 'react-bootstrap';
import { Link } from 'react-router';

import { formatDate } from '../format';
import type { RequestSummary } from '../types';
import { PriorityBadge, RequestStatusBadge } from './Feedback';

interface Props {
  requests: RequestSummary[];
  /** The table's accessible name, for example "My requests". */
  label: string;
  showRequester?: boolean;
}

/** Requests in a table. Each row carries a test ID with its request number. */
export function RequestsTable({ requests, label, showRequester }: Props) {
  return (
    <Table striped hover responsive className="align-middle" aria-label={label}>
      <thead>
        <tr>
          <th scope="col">Number</th>
          <th scope="col">Title</th>
          <th scope="col">Type</th>
          {showRequester && <th scope="col">Requester</th>}
          <th scope="col">Priority</th>
          <th scope="col">Status</th>
          <th scope="col">Submitted</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.number} data-testid={`request-row-${request.number}`}>
            <td className="text-nowrap">
              <Link to={`/requests/${request.number}`}>{request.number}</Link>
            </td>
            <td>{request.title}</td>
            <td>{request.type}</td>
            {showRequester && <td className="text-nowrap">{request.requester_name}</td>}
            <td>
              <PriorityBadge priority={request.priority} />
            </td>
            <td>
              <RequestStatusBadge status={request.status} />
            </td>
            <td className="text-nowrap">{formatDate(request.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
