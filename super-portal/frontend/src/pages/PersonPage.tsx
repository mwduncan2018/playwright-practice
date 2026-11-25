import { Breadcrumb, Card } from 'react-bootstrap';
import { Link, useParams } from 'react-router';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { Detail } from '../components/Detail';
import { ErrorMessage, Loading, NotFoundMessage, RoleBadge } from '../components/Feedback';
import { RequestsTable } from '../components/RequestsTable';
import type { Page, Person, RequestSummary } from '../types';
import { usePageTitle } from '../usePageTitle';

/** A person's directory entry. Admins also see that person's requests. */
export default function PersonPage() {
  const { username = '' } = useParams();
  const { user } = useAuth();
  const loaded = useLoad<Person>(`/api/people/${username}`);
  const requests = useLoad<Page<RequestSummary>>(
    user.isAdmin ? `/api/requests?scope=all&requester=${encodeURIComponent(username)}&page_size=50` : null,
  );
  usePageTitle(loaded.data?.name ?? 'Person');

  if (loaded.error?.status === 404) return <NotFoundMessage what="person" back="/people" backLabel="Back to people" />;
  const person = loaded.data;
  if (!person) return loaded.error ? <ErrorMessage error={loaded.error} onRetry={loaded.reload} /> : <Loading />;

  return (
    <>
      <Breadcrumb data-testid="breadcrumb">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/people', 'data-testid': 'breadcrumb-people-link' }}>
          People
        </Breadcrumb.Item>
        <Breadcrumb.Item active data-testid="breadcrumb-current-item">
          {person.name}
        </Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="h3 mb-3" data-testid="person-heading">
        {person.name}
      </h1>
      <Card className="mb-4" style={{ maxWidth: 720 }} data-testid="person-card">
        <Card.Body>
          <dl className="row mb-0">
            <Detail label="Username" testId="person-username">
              {person.username}
            </Detail>
            <Detail label="Job title" testId="person-title">
              {person.title}
            </Detail>
            <Detail label="Department" testId="person-department">
              {person.department}
            </Detail>
            <Detail label="Location" testId="person-location">
              {person.location}
            </Detail>
            <Detail label="Email" testId="person-email">
              <a href={`mailto:${person.email}`} data-testid="person-email-link">
                {person.email}
              </a>
            </Detail>
            <Detail label="Phone" testId="person-phone">
              {person.phone}
            </Detail>
            <Detail label="Role" testId="person-role">
              <RoleBadge role={person.role} />
            </Detail>
          </dl>
        </Card.Body>
      </Card>
      {user.isAdmin && (
        <>
          <h2 className="h5" data-testid="person-requests-heading">
            Requests by {person.name}
          </h2>
          {requests.error && <ErrorMessage error={requests.error} onRetry={requests.reload} />}
          {requests.data &&
            (requests.data.items.length > 0 ? (
              <RequestsTable
                testId="person-requests-table"
                requests={requests.data.items}
                label={`Requests by ${person.name}`}
              />
            ) : (
              <p className="text-body-secondary" data-testid="person-no-requests-text">
                {person.name} hasn't made any requests.
              </p>
            ))}
        </>
      )}
    </>
  );
}
