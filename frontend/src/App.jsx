import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Vehicles from "./pages/Vehicles";
import Services from "./pages/Services";
import ServiceHistory from "./pages/ServiceHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Login Page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Public Register Page */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected Application */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app">

                <Navbar />

                <div className="main-container">

                  <Sidebar />

                  <Routes>

                    <Route
                      path="/"
                      element={<Dashboard />}
                    />

                    <Route
                      path="/dashboard"
                      element={<Dashboard />}
                    />

                    <Route
                      path="/customers"
                      element={<Customers />}
                    />

                    <Route
                      path="/vehicles"
                      element={<Vehicles />}
                    />

                    <Route
                      path="/services"
                      element={<Services />}
                    />

                    <Route
                      path="/history"
                      element={<ServiceHistory />}
                    />

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