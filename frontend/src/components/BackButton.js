// src/components/BackButton.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css"; // optional

const BackButton = ({ label = "← Back" }) => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(-1)}>
      {label}
    </button>
  );
};

export default BackButton;
