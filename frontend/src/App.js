import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Display from "./pages/Display";
import FlightScheduleMgt from "./pages/FlightScheduleMgt";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import CodeMgtAirport from "./pages/CodeMgtAirport";
import CodeMgtAirline from "./pages/CodeMgtAirline";
import CodeMgtRemark from "./pages/CodeMgtRemark";
import UserMgt from "./pages/UserMgt";
import Arrival from "./pages/Arrival";
import Departure from "./pages/Departure";
import Mixed from "./pages/Mixed";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        // alert("💡 Saving this page is disabled.");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  return (
    <Router>
      {isLoggedIn && <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}

      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/display"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Display />
            </ProtectedRoute>
          }
        />
        <Route
          path="/arrival"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Arrival />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departure"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Departure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mixed"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Mixed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flightschedulemgt"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <FlightScheduleMgt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/codemgtairport"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CodeMgtAirport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/codemgtairline"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CodeMgtAirline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/codemgtremark"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CodeMgtRemark />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usermgt"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <UserMgt />
            </ProtectedRoute>
          }
        />

        <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;