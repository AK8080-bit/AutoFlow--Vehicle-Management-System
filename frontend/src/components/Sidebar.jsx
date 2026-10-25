import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CarFront,
  Wrench,
  Clock3,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: location.pathname === "/" || location.pathname === "/dashboard",
    },
    {
      to: "/customers",
      label: "Customers",
      icon: Users,
      active: location.pathname === "/customers",
    },
    {
      to: "/vehicles",
      label: "Vehicles",
      icon: CarFront,
      active: location.pathname === "/vehicles",
    },
    {
      to: "/services",
      label: "Services",
      icon: Wrench,
      active: location.pathname === "/services",
    },
    {
      to: "/history",
      label: "Service History",
      icon: Clock3,
      active: location.pathname === "/history",
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Mobile Close Button Header */}
        <div className="sidebar-mobile-header">
          <span className="sidebar-section-label">CONSOLE NAVIGATION</span>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-desktop-label sidebar-section-label">MANAGEMENT CONSOLE</div>

        <ul className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className={item.active ? "active" : ""}>
                <Link
                  to={item.to}
                  className="sidebar-link"
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                >
                  <span className="sidebar-link-icon">
                    <Icon size={19} />
                  </span>
                  <span className="sidebar-link-text">{item.label}</span>
                  {item.active && (
                    <ChevronRight size={15} className="sidebar-active-arrow" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer-card">
          <div className="footer-card-glow"></div>
          <div className="footer-card-header">
            <Sparkles size={16} className="text-amber-400" />
            <span>Pro Enterprise v2.5</span>
          </div>
          <p className="footer-card-desc">
            Automated workshop dispatch & live telemetry active.
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;