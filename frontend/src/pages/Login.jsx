import { useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const response = await API.post(
        "/admin/login",
        formData
      );

      // Save JWT token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Save admin information
      localStorage.setItem(
        "admin",
        JSON.stringify(response.data.admin)
      );

      // Go to Dashboard
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-icon">
          🚗
        </div>

        <h1>Admin Login</h1>

        <p className="login-subtitle">
          Vehicle Service Management
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">
            🔐 Login
          </button>

        </form>

        {/* Create New Admin */}
        <button
          type="button"
          className="register-btn"
          onClick={() => navigate("/register")}
        >
          ➕ Create New Admin
        </button>

      </div>
    </div>
  );
}

export default Login;