import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  Wrench,
  Mail,
  Lock,
  LogIn,
  ShieldCheck,
  AlertCircle,
  CarFront,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  // Start with empty credentials (do not prefill email/pass)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const response = await API.post("/admin/login", formData);

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      // Save admin information
      localStorage.setItem("admin", JSON.stringify(response.data.admin));

      // Redirect to Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please verify your admin password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="trending-grid-pattern"></div>
      <div className="trending-aurora-orb orb-1"></div>
      <div className="trending-aurora-orb orb-2"></div>
      <div className="trending-aurora-orb orb-3"></div>
      <div className="login-backdrop-glow"></div>
      <div className="login-card-pro">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon">
            <Wrench size={26} />
          </div>
          <h1 className="login-title">AutoFlow</h1>
          <div className="login-security-indicator">
            <ShieldCheck size={13} style={{ color: "#2563eb" }} />
            <span>Encrypted Admin Console</span>
          </div>
        </div>

        <div className="login-welcome-text">
          <h2>Administrator Sign In</h2>
          <p>Enter your administrative credentials to manage garage records</p>
        </div>

        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email / Username Field */}
          <div className="auth-field">
            <label className="auth-label">
              <Mail size={14} /> Admin Username / Email
            </label>
            <div className="auth-input-wrap">
              <input
                type={showEmail ? "email" : "password"}
                name="email"
                placeholder="Enter admin email address"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowEmail(!showEmail)}
                className="auth-toggle-eye-btn"
                title={showEmail ? "Hide email address" : "Show email address"}
              >
                {showEmail ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Password Field with Eye Reveal Button */}
          <div className="auth-field">
            <label className="auth-label">
              <Lock size={14} /> Admin Password
            </label>
            <div className="auth-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your admin password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-toggle-eye-btn"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <LogIn size={17} />
            <span>{loading ? "Verifying Credentials..." : "Access Admin Console"}</span>
          </button>
        </form>

        <div className="auth-card-footer">
          <p className="auth-footer-prompt">Are you a vehicle customer checking repair status?</p>
          <Link to="/" className="auth-secondary-btn">
            <CarFront size={16} />
            <span>Customer Tracking Portal</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;