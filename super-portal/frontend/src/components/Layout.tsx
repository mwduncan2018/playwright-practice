import { Badge, Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth';

export function Layout() {
  const { user, signOut } = useAuth();
  return (
    <>
      <Navbar bg="primary" data-bs-theme="dark" expand="lg" className="mb-4" aria-label="Main">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Super Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-menu" />
          <Navbar.Collapse id="main-menu">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/catalog">
                New request
              </Nav.Link>
              <Nav.Link as={NavLink} to="/requests">
                My requests
              </Nav.Link>
              {user.isAdmin && (
                <>
                  <Nav.Link as={NavLink} to="/approvals">
                    Approvals
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/all-requests">
                    All requests
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/reports">
                    Reports
                  </Nav.Link>
                </>
              )}
              <Nav.Link as={NavLink} to="/announcements">
                Announcements
              </Nav.Link>
              <Nav.Link as={NavLink} to="/people">
                People
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown
                align="end"
                id="user-menu"
                title={
                  <>
                    {user.name}
                    {user.isAdmin && (
                      <Badge bg="light" text="dark" className="ms-2">
                        Admin
                      </Badge>
                    )}
                  </>
                }
              >
                <NavDropdown.Item as={Link} to="/settings">
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as="button" onClick={signOut}>
                  Sign out
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container as="main" className="pb-5">
        <Outlet />
      </Container>
    </>
  );
}
