import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { NavLink } from "react-router-dom";

export default props => {
  const { children } = props;

  return (
    <div>
      <Navbar color="primary" dark expand="md">
        <NavLink className="nav-link" to="/">
          <NavbarBrand>Parrot Exchange</NavbarBrand>
        </NavLink>
      </Navbar>
      {children}
    </div>
  );
};
