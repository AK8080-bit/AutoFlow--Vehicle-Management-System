import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [vehicles, setVehicles] = useState(0);
  const [pendingServices, setPendingServices] = useState(0);
  const [inProgressServices, setInProgressServices] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [recentServices, setRecentServices] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const customerResponse = await API.get(
        "/customers"
      );

      const vehicleResponse = await API.get(
        "/vehicles"
      );

      const serviceResponse = await API.get(
        "/services"
      );

      const services = serviceResponse.data;

      setCustomers(customerResponse.data.length);

      setVehicles(vehicleResponse.data.length);

      setPendingServices(
        services.filter(
          (service) =>
            service.serviceStatus === "Pending"
        ).length
      );

      setInProgressServices(
        services.filter(
          (service) =>
            service.serviceStatus === "In Progress"
        ).length
      );

      setCompletedServices(
        services.filter(
          (service) =>
            service.serviceStatus === "Completed"
        ).length
      );

      const latestServices = [...services]
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5);

      setRecentServices(latestServices);
    } catch (error) {
      console.error(
        "Error fetching dashboard data:",
        error
      );
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome to Vehicle Service Management
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card dashboard-card customers-card">
          <div className="card-icon">👥</div>

          <div>
            <h3>Total Customers</h3>
            <p>{customers}</p>
          </div>
        </div>

        <div className="card dashboard-card vehicles-card">
          <div className="card-icon">🚗</div>

          <div>
            <h3>Total Vehicles</h3>
            <p>{vehicles}</p>
          </div>
        </div>

        <div className="card dashboard-card pending-card">
          <div className="card-icon">⏳</div>

          <div>
            <h3>Pending Services</h3>
            <p>{pendingServices}</p>
          </div>
        </div>

        <div className="card dashboard-card completed-card">
          <div className="card-icon">✅</div>

          <div>
            <h3>Completed Services</h3>
            <p>{completedServices}</p>
          </div>
        </div>
      </div>

      {/* Service Status Summary */}
      <div className="status-summary">
        <div className="status-box">
          <span className="status-dot pending-dot"></span>

          <div>
            <h4>Pending</h4>
            <p>{pendingServices}</p>
          </div>
        </div>

        <div className="status-box">
          <span className="status-dot progress-dot"></span>

          <div>
            <h4>In Progress</h4>
            <p>{inProgressServices}</p>
          </div>
        </div>

        <div className="status-box">
          <span className="status-dot completed-dot"></span>

          <div>
            <h4>Completed</h4>
            <p>{completedServices}</p>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="customer-list recent-services">
        <div className="section-header">
          <h2>🔧 Recent Services</h2>

          <span>
            Latest 5 Services
          </span>
        </div>

        {recentServices.length === 0 ? (
          <div className="empty-state">
            <div>📋</div>

            <p>No recent services available.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Vehicle Number</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentServices.map(
                  (service, index) => (
                    <tr key={service._id}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {service.serviceName}
                        </strong>
                      </td>

                      <td>
                        {service.vehicleNumber}
                      </td>

                      <td>
                        {new Date(
                          service.serviceDate
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        ₹{service.serviceCost}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            service.serviceStatus
                              .toLowerCase()
                              .replace(" ", "-")
                          }`}
                        >
                          {service.serviceStatus}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;