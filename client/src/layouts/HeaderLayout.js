import React, { useState } from "react";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem } from "reactstrap";
import { NavLink } from "react-router-dom";

export default props => {
  const { children } = props;
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="primary" dark expand="md">
        <NavLink className="nav-link" to="/">
          <NavbarBrand>Parrot Exchange</NavbarBrand>
        </NavLink>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink to="/" className="nav-link">Inicio</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      {children}
    </div>
  );
};
