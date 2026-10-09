import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <h2>Menu</h2>

      <ul>

        <li>
          <Link to="/dashboard">
            🏠 Dashboard
          </Link>
        </li>

        <li>
          <Link to="/customers">
            👤 Customers
          </Link>
        </li>

        <li>
          <Link to="/vehicles">
            🚗 Vehicles
          </Link>
        </li>

        <li>
          <Link to="/services">
            🔧 Services
          </Link>
        </li>

        <li>
          <Link to="/history">
            📋 Service History
          </Link>
        </li>

      </ul>

    </aside>
  );
}

export default Sidebar;