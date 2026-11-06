import { Badge, Button, Card } from 'react-bootstrap';

import { useAuth } from '../auth';
import { Detail } from '../components/Detail';
import { usePageTitle } from '../usePageTitle';

export default function AccountPage() {
  usePageTitle('My account');
  const { user, signOut, accountUrl } = useAuth();
  return (
    <>
      <h1 className="h3 mb-3">My account</h1>
      <Card style={{ maxWidth: 640 }}>
        <Card.Body>
          <dl className="row mb-0">
            <Detail label="Name" testId="account-name">
              {user.name}
            </Detail>
            <Detail label="Username" testId="account-username">
              {user.username}
            </Detail>
            <Detail label="Email" testId="account-email">
              {user.email || 'None'}
            </Detail>
            <Detail label="Roles" testId="account-roles">
              {user.roles.map((role) => (
                <Badge key={role} bg={role === 'admin' ? 'info' : 'secondary'} text={role === 'admin' ? 'dark' : undefined} className="me-1">
                  {role}
                </Badge>
              ))}
            </Detail>
          </dl>
          <p className="mt-3 mb-0" data-testid="account-permissions">
            {user.isAdmin
              ? 'As an admin you can create, change and delete records, and see the activity log.'
              : 'You can view everything in the catalog. Only admins can make changes.'}
          </p>
        </Card.Body>
        <Card.Footer className="d-flex flex-wrap gap-2">
          <Button href={accountUrl} target="_blank" rel="noreferrer" variant="outline-secondary">
            Manage your account in Keycloak
          </Button>
          <Button variant="outline-danger" onClick={signOut}>
            Sign out
          </Button>
        </Card.Footer>
      </Card>
    </>
  );
}
