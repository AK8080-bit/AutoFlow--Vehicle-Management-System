import { useNavigate, Link } from "react-router-dom";
import { Wrench, LogOut, ShieldCheck, User, Sparkles, CarFront } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

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
      <Link to="/dashboard" className="logo-container">
        <div className="logo-icon-badge">
          <Wrench className="brand-icon" size={22} />
        </div>
        <div className="logo-text-group">
          <div className="logo-title">
            Auto<span>Flow</span>
          </div>
          <span className="logo-subtitle">Service Hub</span>
        </div>
      </Link>

      <div className="navbar-actions">
        <Link to="/" className="portal-switch-link" title="Open Customer Vehicle Tracking Portal">
          <CarFront size={15} />
          <span>Customer Tracking Portal</span>
        </Link>

        <div className="system-pill">
          <span className="system-status-dot"></span>
          <span className="system-status-text">System Live</span>
        </div>

        <div className="admin-section">
          <div className="admin-card">
            <div className="admin-avatar">
              <User size={18} />
            </div>
            <div className="admin-info">
              <span className="admin-name">{admin?.name || "Administrator"}</span>
              <span className="admin-role">
                <ShieldCheck size={12} className="role-icon" /> Master Admin
              </span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Sign out of account"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;