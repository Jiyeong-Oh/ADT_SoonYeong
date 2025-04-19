import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import "./Signup.css";

const Signup = () => {
  const [form, setForm] = useState({
    userID: "",
    userName: "",
    password: "",
    airlineCode: ""
  });

  const [error, setError] = useState("");
  const [airlines, setAirlines] = useState([]);
  const navigate = useNavigate();

  // 🔁 Load airline list from backend
  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const res = await fetch("http://localhost:9999/api/airlines");
        const data = await res.json();
        setAirlines(data);
      } catch (err) {
        console.error("Failed to load airlines:", err);
      }
    };
    fetchAirlines();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.userID || !form.userName || !form.password) {
      setError("User ID, Name, and Password are required.");
      return;
    }

    // 🔐 Hash password using SHA-256
    const hashPassword = async (password) => {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, "0")).join("");
    };

    const hashedPassword = await hashPassword(form.password);

    const newUser = {
      userID: form.userID,
      userName: form.userName,
      password: hashedPassword,
      airlineCode: form.airlineCode
    };

    try {
      const response = await fetch("http://localhost:9999/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const resText = await response.text();
        throw new Error(resText || "Signup failed.");
      }
      navigate("/login", {
        state: { message: "Account created successfully! Please log in." }
      });
    } catch (err) {
      setError(err.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-box">
        <BackButton label="← Back to Login" />
        <h2 className="signup-title">Sign Up</h2>
        {error && <p className="signup-error">{error}</p>}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>User ID</label>
            <input
              name="userID"
              value={form.userID}
              onChange={handleChange}
              required
              placeholder="e.g., lee2025"
            />
            <small className="form-hint">Unique ID used to log in</small>
          </div>

          <div className="form-group">
            <label>User Name</label>
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              required
              placeholder="e.g., Soon Young Lee"
            />
            <small className="form-hint">Your full name or display name</small>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter a strong password"
            />
            <small className="form-hint">Minimum 6 characters recommended</small>
          </div>
          <div className="form-group">
            <label>Airline</label>
            <select
              name="airlineCode"
              value={form.airlineCode}
              onChange={handleChange}
            >
              <option value="">-- Select an airline --</option>
              {airlines.map((airline) => (
                <option key={airline.AirlineCode} value={airline.AirlineCode}>
                  {airline.AirlineName} ({airline.AirlineCode})
                </option>
              ))}
            </select>
            <small className="form-hint">Optional: your affiliated airline</small>
          </div>

          <button type="submit" className="signup-button">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
