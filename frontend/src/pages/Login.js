import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || "";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔐 SHA-256 Hash
  const hashPassword = async (password) => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.id || !form.password) {
      setError("Please enter both ID and password.");
      return;
    }

    try {
      const hashedPassword = await hashPassword(form.password);

      const res = await fetch("http://localhost:9999/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: form.id,
          password: hashedPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userID", data.user.userID);
      localStorage.setItem("userName", data.user.userName);
      localStorage.setItem("airlineCode", data.user.airlineCode || "");

      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="project-title">ADT Final Project (SoonYoung)</h1>
      <div className="login-wrapper">
        <div className="login-box">
          <h2 className="login-title">Login</h2>
          {successMessage && <p className="login-success">{successMessage}</p>}
          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>ID</label>
              <input
                name="id"
                value={form.id}
                onChange={handleChange}
                placeholder="Enter your ID"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>
            <button className="login-button" type="submit">
              Login
            </button>
          </form>

          <p className="signup-text">
            Don’t have an account?{" "}
            <a href="/signup" className="signup-link">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
