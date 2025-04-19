import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [form, setForm] = useState({ id: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // ✅ ID-only user list
    const validUsers = [
      { id: "soon01", password: "soon1234!" },
      { id: "admin01", password: "admin1234!" },
    ];

    const matchedUser = validUsers.find(
      (user) =>
        user.id === form.id && user.password === form.password
    );
    if (matchedUser) {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      navigate("/home");
    } else {
      setError("Invalid ID or password");
    }
  };

  return (
    <div>
      <h1 className="project-title">ADT Final Project (SoonYoeng)</h1>
      <div className="login-wrapper">
        <div className="login-box">
          <h2 className="login-title">Login</h2>
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
