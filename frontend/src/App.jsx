import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Vehicles from "./pages/Vehicles";
import Services from "./pages/Services";
import ServiceHistory from "./pages/ServiceHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public User Dashboard / Vehicle Repair Status Tracker */}
        <Route path="/" element={<UserDashboard />} />
        <Route path="/track" element={<UserDashboard />} />

        {/* Admin Login Only (Default Admin: ashokkhotkar8080@gmail.com) */}
        <Route path="/login" element={<Login />} />

        {/* Public Admin Account Creation is Disabled */}
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* Protected Admin Console (Only Admin Uploads / Modifies Data) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app">
                <Navbar />

                <div className="main-container">
                  <Sidebar />

                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/history" element={<ServiceHistory />} />

                    {/* Fallback to admin dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;