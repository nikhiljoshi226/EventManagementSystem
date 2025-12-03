// client/src/components/Navigation.js
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navigation = () => {
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
            <Nav.Link as={Link} to="/student">Student Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/sponsor">Partner Portal</Nav.Link>
            <Nav.Link as={Link} to="/admin">Admin Console</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;