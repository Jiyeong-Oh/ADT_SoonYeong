import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Display from "./pages/Display";
import FlightScheduleMgt from "./pages/FlightScheduleMgt";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import CodeMgt from "./pages/CodeMgt";
import UserMgt from "./pages/UserMgt";
import Arrival from "./pages/Arrival";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
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
          path="/flightschedulemgt"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <FlightScheduleMgt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/codemgt"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CodeMgt />
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