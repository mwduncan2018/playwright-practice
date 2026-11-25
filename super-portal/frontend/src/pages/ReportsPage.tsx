import { Alert, Card, Col, ProgressBar, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router';

import { useLoad } from '../api';
import { ErrorMessage, Loading } from '../components/Feedback';
import { waitingTime } from '../format';
import { testIdPart } from '../testIds';
import type { Count, Reports } from '../types';
import { usePageTitle } from '../usePageTitle';

function countOf(counts: Count[], label: string): number {
  return counts.find((count) => count.label === label)?.count ?? 0;
}

export default function ReportsPage() {
  usePageTitle('Reports');
  const { data, error, loading, reload } = useLoad<Reports>('/api/reports');

  return (
    <>
      <h1 className="h3 mb-3" data-testid="reports-heading">
        Reports
      </h1>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <>
          <Row xs={2} md={3} xl={5} className="g-3 mb-4">
            <Stat testId="report-total" label="Requests" value={String(data.total)} />
            <Stat testId="report-waiting" label="Waiting for a decision" value={String(countOf(data.by_status, 'Submitted'))} />
            <Stat testId="report-approved" label="Approved" value={String(countOf(data.by_status, 'Approved'))} />
            <Stat testId="report-rejected" label="Rejected" value={String(countOf(data.by_status, 'Rejected'))} />
            <Stat
              testId="report-average"
              label="Average time to a decision"
              value={data.average_decision_hours === null ? '—' : `${data.average_decision_hours} h`}
            />
          </Row>
          {data.oldest_waiting && (
            <Alert variant="warning" data-testid="report-oldest">
              Oldest waiting:{' '}
              <Link to={`/requests/${data.oldest_waiting.number}`} data-testid="report-oldest-link">
                {data.oldest_waiting.number} {data.oldest_waiting.title}
              </Link>{' '}
              from {data.oldest_waiting.requester_name}, waiting {waitingTime(data.oldest_waiting.created_at).toLowerCase()}.
            </Alert>
          )}
          <Row className="g-4">
            <Col lg={4}>
              <CountTable title="By status" column="Status" counts={data.by_status} total={data.total} />
            </Col>
            <Col lg={4}>
              <CountTable title="By type" column="Type" counts={data.by_type} total={data.total} />
            </Col>
            <Col lg={4}>
              <CountTable title="By priority" column="Priority" counts={data.by_priority} total={data.total} />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

function Stat({ testId, label, value }: { testId: string; label: string; value: string }) {
  return (
    <Col>
      <Card className="h-100" data-testid={testId}>
        <Card.Body>
          <div className="stat-value" data-testid={`${testId}-value`}>
            {value}
          </div>
          <div className="text-body-secondary" data-testid={`${testId}-label-text`}>
            {label}
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}

/**
 * A table of counts, such as "By status". Its test IDs start with "report-" and the title, such as
 * "report-by-status-table". Each row's test ID ends in its label, such as "count-row-submitted".
 */
function CountTable({ title, column, counts, total }: { title: string; column: string; counts: Count[]; total: number }) {
  const testId = `report-${testIdPart(title)}`;
  return (
    <Card data-testid={`${testId}-card`}>
      <Card.Header as="h2" className="h6 py-3 mb-0" data-testid={`${testId}-heading`}>
        {title}
      </Card.Header>
      <Table size="sm" className="mb-0 align-middle" aria-label={`Requests ${title.toLowerCase()}`} data-testid={`${testId}-table`}>
        <thead>
          <tr data-testid={`${testId}-table-header-row`}>
            <th scope="col" className="ps-3" data-testid={`${testId}-table-${testIdPart(column)}-header`}>
              {column}
            </th>
            <th scope="col" className="text-end" data-testid={`${testId}-table-requests-header`}>
              Requests
            </th>
            <th scope="col" className="pe-3" style={{ width: '45%' }} data-testid={`${testId}-table-share-header`}>
              Share
            </th>
          </tr>
        </thead>
        <tbody>
          {counts.map(({ label, count }) => {
            const share = total ? Math.round((count / total) * 100) : 0;
            return (
              <tr key={label} data-testid={`count-row-${testIdPart(label)}`}>
                <td className="ps-3" data-testid="label-cell">
                  {label}
                </td>
                <td className="text-end" data-testid="count-cell">
                  {count}
                </td>
                <td className="pe-3" data-testid="share-cell">
                  <ProgressBar
                    now={share}
                    label={`${share}%`}
                    visuallyHidden={share < 15}
                    aria-label={`${label}: ${share}%`}
                    data-testid="share-progress-bar"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}
