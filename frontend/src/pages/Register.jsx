import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Wrench,
  User,
  Mail,
  Lock,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.name.trim().length < 2) {
      setError("Name must contain at least 2 characters");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await API.post("/admin/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess("Admin account created successfully! Redirecting...");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop-glow"></div>
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <Wrench size={28} />
          </div>
          <h1 className="login-title">AutoFlow</h1>
          <span className="login-badge">
            <ShieldCheck size={12} /> Administrator Onboarding
          </span>
        </div>

        <div className="login-welcome-text">
          <h2>Create Admin Account</h2>
          <p>Register credentials to grant administrative rights</p>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="login-success-banner">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">
              <User size={14} /> Full Name
            </label>
            <div className="auth-input-wrap">
              <input
                type="text"
                name="name"
                placeholder="Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <Mail size={14} /> Official Email
            </label>
            <div className="auth-input-wrap">
              <input
                type="email"
                name="email"
                placeholder="admin@autoflow.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <Lock size={14} /> Security Password
            </label>
            <div className="auth-input-wrap">
              <input
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">
              <Lock size={14} /> Confirm Password
            </label>
            <div className="auth-input-wrap">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <UserPlus size={17} />
            <span>{loading ? "Creating Account..." : "Create Admin Account"}</span>
          </button>
        </form>

        <div className="auth-card-footer">
          <button
            type="button"
            className="auth-secondary-btn"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft size={15} />
            <span>Return to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;