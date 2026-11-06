import { Badge, Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { Link, NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth';

export function Layout() {
  const { user, signOut } = useAuth();
  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="md" className="mb-4" aria-label="Main">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Super Catalog
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-menu" />
          <Navbar.Collapse id="main-menu">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/" end>
                Dashboard
              </Nav.Link>
              <Nav.Link as={NavLink} to="/products">
                Products
              </Nav.Link>
              <Nav.Link as={NavLink} to="/categories">
                Categories
              </Nav.Link>
              <Nav.Link as={NavLink} to="/suppliers">
                Suppliers
              </Nav.Link>
              {user.isAdmin && (
                <Nav.Link as={NavLink} to="/activity">
                  Activity log
                </Nav.Link>
              )}
            </Nav>
            <Nav>
              <NavDropdown
                align="end"
                id="user-menu"
                title={
                  <>
                    {user.name}
                    {user.isAdmin && (
                      <Badge bg="info" text="dark" className="ms-2">
                        Admin
                      </Badge>
                    )}
                  </>
                }
              >
                <NavDropdown.Item as={Link} to="/account">
                  My account
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
