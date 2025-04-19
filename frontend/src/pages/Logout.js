// src/pages/Logout.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");

    // Redirect to login
    navigate("/login");
  }, [setIsLoggedIn, navigate]);

  return null; // No visible UI needed
};

export default Logout;