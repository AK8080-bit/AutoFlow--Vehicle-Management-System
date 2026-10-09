import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const admin = JSON.parse(
    localStorage.getItem("admin")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        🚗 Vehicle Service Management
      </div>

      <div className="admin-section">
        <div className="admin-name">
          👤 {admin?.name || "Admin"}
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;