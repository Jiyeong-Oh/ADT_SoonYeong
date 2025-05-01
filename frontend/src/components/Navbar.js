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
                <a href="/departure">Departures</a>
                <a href="/arrival">Arrivals</a>
                <a href="/mixed">Mixed</a>
              </div>
            </div></li>
            <li><Link to="/flightschedulemgt">Flight Schedule Management<span> </span></Link></li>

            <li><div className="nav-item dropdown">
              <span className="menu-title">Code Management</span>
              <div className="dropdown-menu">
                <a href="/codemgtairport">Airports</a>
                <a href="/codemgtairline">Airlines</a>
                <a href="/codemgtremark">Remarks</a>
              </div>
            </div></li>
            <li><div className="nav-item dropdown">
              <span className="menu-title">User Role Management</span>
              <div className="dropdown-menu">
                <a href="/usermgtuser">Users</a>
                <a href="/usermgtrole">Roles</a>
                <a href="/usermgtuserrole">User Role</a>
              </div>
            </div></li>
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
