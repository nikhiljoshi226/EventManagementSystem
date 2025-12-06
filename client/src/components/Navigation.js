// client/src/components/Navigation.js
import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { user } = useContext(AuthContext);

  return (
    <Navbar 
      bg="custom" 
      variant="dark" 
      expand="lg" 
      className="tamu-header"
      style={{ backgroundColor: '#500000' }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          CMIS Engagement Portal
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && user.role === 'Student' && (
              <Nav.Link as={Link} to="/student">Profile</Nav.Link>
            )}
            {user && user.role === 'Mentor' && (
              <Nav.Link as={Link} to="/mentor">Profile</Nav.Link>
            )}
            {user && (user.role === 'Sponsor' || user.role === 'Mentor') && (
              <Nav.Link as={Link} to="/sponsor">Profile</Nav.Link>
            )}
            {user && user.role === 'Faculty' && (
              <Nav.Link as={Link} to="/faculty">Profile</Nav.Link>
            )}
            {user && user.role === 'Admin' && (
              <Nav.Link as={Link} to="/admin">Admin Console</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;