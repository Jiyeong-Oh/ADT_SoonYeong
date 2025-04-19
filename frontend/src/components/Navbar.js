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
            <li><div className="nav-item dropdown">
              <span className="menu-title">Display Management</span>
              <div className="dropdown-menu">
                <a href="/display">Departure Display</a>
                <a href="/arrival">Arrival Display</a>
                <a href="/display">Mixed Display</a>
              </div>
            </div></li>
            <li><Link to="/flightschedulemgt">Flight Schedule Management<span> </span></Link></li>
            <li><Link to="/codemgt">Code Management <span> </span></Link></li>
            <li><Link to="/usermgt">User Management</Link></li>
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
