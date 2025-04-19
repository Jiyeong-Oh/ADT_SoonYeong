import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isLoggedIn }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <img
            src="/images/trident-tab-promo.jpg"
            alt="Logo"
            className="logo-img"
          />
        </div>
        {isLoggedIn && (
          <ul className="nav-links">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/display">Display Management<span> </span></Link></li>
            <li><Link to="/schedule">Flight Schedule <span> </span></Link></li>
            <li><Link to="/coden">Code Management <span> </span></Link></li>
            <li><Link to="/system">System Management</Link></li>
          </ul>
        )}
      </div>
      {isLoggedIn && (
        <Link to="/logout" className="logout-button">
          Logout
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
