import { Badge, Container, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth';

export function Layout() {
  const { user, signOut } = useAuth();
  return (
    <>
      <Navbar data-bs-theme="dark" expand="lg" className="app-navbar mb-4" aria-label="Main" data-testid="navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" data-testid="navbar-brand-link">
            Super Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-menu" data-testid="navbar-toggle-button" />
          <Navbar.Collapse id="main-menu">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end data-testid="navbar-home-link">
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/catalog" data-testid="navbar-new-request-link">
                New request
              </Nav.Link>
              <Nav.Link as={NavLink} to="/requests" data-testid="navbar-my-requests-link">
                My requests
              </Nav.Link>
              {user.isAdmin && (
                <>
                  <Nav.Link as={NavLink} to="/approvals" data-testid="navbar-approvals-link">
                    Approvals
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/all-requests" data-testid="navbar-all-requests-link">
                    All requests
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/reports" data-testid="navbar-reports-link">
                    Reports
                  </Nav.Link>
                </>
              )}
              <Nav.Link as={NavLink} to="/announcements" data-testid="navbar-announcements-link">
                Announcements
              </Nav.Link>
              <Nav.Link as={NavLink} to="/people" data-testid="navbar-people-link">
                People
              </Nav.Link>
            </Nav>
            <Nav>
              {/* The parts NavDropdown is made of, so the button that opens the menu can carry a test ID. */}
              <Dropdown align="end" className="nav-item">
                <Dropdown.Toggle as={Nav.Link} id="user-menu" data-testid="user-menu-button">
                  {user.name}
                  {user.isAdmin && (
                    <Badge bg="light" text="dark" className="ms-2" data-testid="user-menu-admin-badge">
                      Admin
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/settings" data-testid="user-menu-settings-link">
                    Settings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item as="button" onClick={signOut} data-testid="user-menu-sign-out-button">
                    Sign out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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
