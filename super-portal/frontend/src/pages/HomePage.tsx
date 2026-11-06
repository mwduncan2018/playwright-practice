import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';

import { useLoad } from '../api';
import { useAuth } from '../auth';
import { AnnouncementList } from '../components/AnnouncementList';
import { ErrorMessage, Loading } from '../components/Feedback';
import { LinkButton } from '../components/LinkButton';
import { RequestsTable } from '../components/RequestsTable';
import type { Home } from '../types';
import { usePageTitle } from '../usePageTitle';

export default function HomePage() {
  usePageTitle('Home');
  const { user } = useAuth();
  const { data, error, loading, reload } = useLoad<Home>('/api/home');
  const admin = data?.approvals_waiting !== null && data?.approvals_waiting !== undefined;

  return (
    <>
      <h1 className="h3">Home</h1>
      <p className="text-body-secondary">Welcome, {user.name}.</p>
      {error && <ErrorMessage error={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="h-100" data-testid="home-open-requests">
                <Card.Body>
                  <div className="stat-value">{data.open_count}</div>
                  <Link to="/requests?status=Submitted" className="stretched-link text-body-secondary text-decoration-none">
                    My open requests
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            {admin && (
              <Col md={4}>
                <Card className="h-100" data-testid="home-approvals-waiting">
                  <Card.Body>
                    <div className="stat-value">{data.approvals_waiting}</div>
                    <Link to="/approvals" className="stretched-link text-body-secondary text-decoration-none">
                      Waiting for my approval
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            )}
            <Col md={admin ? 4 : 8}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title as="h2" className="h6">
                    Start a request
                  </Card.Title>
                  <div className="d-flex flex-wrap gap-2">
                    <LinkButton to="/catalog?new=Equipment" variant="outline-primary">
                      Request equipment
                    </LinkButton>
                    <LinkButton to="/catalog?new=Software" variant="outline-primary">
                      Request software
                    </LinkButton>
                    <LinkButton to="/catalog?new=Access" variant="outline-primary">
                      Request access
                    </LinkButton>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-4">
            <Col lg={7}>
              <h2 className="h5">My recent requests</h2>
              {data.recent.length > 0 ? (
                <RequestsTable requests={data.recent} label="My recent requests" />
              ) : (
                <p className="text-body-secondary">You haven't made any requests yet.</p>
              )}
              <Link to="/requests">See all my requests</Link>
            </Col>
            <Col lg={5}>
              <h2 className="h5">Announcements</h2>
              <AnnouncementList announcements={data.announcements} label="Latest announcements" />
              <Link to="/announcements">See all announcements</Link>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
