import { useNavigate, Link } from "react-router-dom";
import {
  Wrench,
  LogOut,
  ShieldCheck,
  User,
  CarFront,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const admin = JSON.parse(
    localStorage.getItem("admin") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-group">
        {/* Mobile Hamburger Button */}
        {onToggleSidebar && (
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation drawer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <Link to="/dashboard" className="logo-container">
          <div className="logo-icon-badge">
            <Wrench className="brand-icon" size={20} />
          </div>
          <div className="logo-text-group">
            <div className="logo-title">
              Auto<span>Flow</span>
            </div>
            <span className="logo-subtitle">Service Hub</span>
          </div>
        </Link>
      </div>

      <div className="navbar-actions">
        {/* Link to Customer Tracking Portal */}
        <Link to="/" className="portal-switch-link" title="Open Customer Vehicle Tracking Portal">
          <CarFront size={15} />
          <span className="nav-link-text">Tracking Portal</span>
        </Link>

        {/* Live System Pill */}
        <div className="system-pill hide-on-mobile">
          <span className="system-status-dot"></span>
          <span className="system-status-text">Live Bay</span>
        </div>

        {/* Dark Mode Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-slate-600" />
          )}
        </button>

        {/* Admin Section */}
        <div className="admin-section">
          <div className="admin-card">
            <div className="admin-avatar">
              <User size={16} />
            </div>
            <div className="admin-info hide-on-mobile">
              <span className="admin-name">{admin?.name || "Admin"}</span>
              <span className="admin-role">
                <ShieldCheck size={11} className="role-icon" /> Master
              </span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Sign out of account"
          >
            <LogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;