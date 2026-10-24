import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Users,
  CarFront,
  Clock3,
  CheckCircle2,
  Wrench,
  Activity,
  ArrowUpRight,
  Calendar,
  IndianRupee,
  AlertCircle
} from "lucide-react";

function Dashboard() {
  const [customers, setCustomers] = useState(0);
  const [vehicles, setVehicles] = useState(0);
  const [pendingServices, setPendingServices] = useState(0);
  const [inProgressServices, setInProgressServices] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [recentServices, setRecentServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const customerResponse = await API.get("/customers");
      const vehicleResponse = await API.get("/vehicles");
      const serviceResponse = await API.get("/services");

      const services = serviceResponse.data || [];

      setCustomers(customerResponse.data?.length || 0);
      setVehicles(vehicleResponse.data?.length || 0);

      setPendingServices(
        services.filter((service) => service.serviceStatus === "Pending").length
      );

      setInProgressServices(
        services.filter((service) => service.serviceStatus === "In Progress").length
      );

      setCompletedServices(
        services.filter((service) => service.serviceStatus === "Completed").length
      );

      const latestServices = [...services]
        .sort((a, b) => new Date(b.createdAt || b.serviceDate) - new Date(a.createdAt || a.serviceDate))
        .slice(0, 5);

      setRecentServices(latestServices);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalServices = pendingServices + inProgressServices + completedServices;

  return (
    <main className="dashboard">
      {/* Top Banner / Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-pretitle">
            <Activity size={14} className="pulse-icon" /> Operational Overview
          </div>
          <h1 className="page-heading">Executive Dashboard</h1>
          <p className="page-subheading">
            Live fleet telemetry, customer engagements, and service workflows
          </p>
        </div>

        <div className="dashboard-header-right">
          <div className="date-badge">
            <Calendar size={15} />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="cards">
        <div className="card dashboard-card customers-card">
          <div className="card-top">
            <span className="card-label">Total Customers</span>
            <div className="card-icon blue">
              <Users size={22} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{customers}</div>
            <span className="card-trend positive">Active Directory</span>
          </div>
        </div>

        <div className="card dashboard-card vehicles-card">
          <div className="card-top">
            <span className="card-label">Total Vehicles</span>
            <div className="card-icon purple">
              <CarFront size={22} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{vehicles}</div>
            <span className="card-trend positive">Fleet Registered</span>
          </div>
        </div>

        <div className="card dashboard-card pending-card">
          <div className="card-top">
            <span className="card-label">Pending Services</span>
            <div className="card-icon amber">
              <Clock3 size={22} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{pendingServices}</div>
            <span className="card-trend warning">Awaiting Action</span>
          </div>
        </div>

        <div className="card dashboard-card completed-card">
          <div className="card-top">
            <span className="card-label">Completed Services</span>
            <div className="card-icon green">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="card-bottom">
            <div className="card-value">{completedServices}</div>
            <span className="card-trend success">Successfully Finished</span>
          </div>
        </div>
      </div>

      {/* Service Status Breakdown */}
      <div className="status-summary-container">
        <div className="status-summary-header">
          <div className="status-summary-title">
            <Wrench size={17} />
            <span>Service Pipeline Status</span>
          </div>
          <span className="status-summary-total">Total: {totalServices}</span>
        </div>

        <div className="status-summary">
          <div className="status-box pending-box">
            <div className="status-box-header">
              <span className="status-dot pending-dot"></span>
              <h4>Pending</h4>
            </div>
            <p className="status-box-count">{pendingServices}</p>
          </div>

          <div className="status-box progress-box">
            <div className="status-box-header">
              <span className="status-dot progress-dot"></span>
              <h4>In Progress</h4>
            </div>
            <p className="status-box-count">{inProgressServices}</p>
          </div>

          <div className="status-box completed-box">
            <div className="status-box-header">
              <span className="status-dot completed-dot"></span>
              <h4>Completed</h4>
            </div>
            <p className="status-box-count">{completedServices}</p>
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="customer-list recent-services">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-icon-badge">
              <Activity size={18} />
            </div>
            <div>
              <h2>Recent Service Records</h2>
              <p className="section-subtext">The 5 most recent service entries logged in the system</p>
            </div>
          </div>
          <span className="record-count-badge">
            Latest 5 Services
          </span>
        </div>

        {recentServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Wrench size={38} />
            </div>
            <h3>No Service Activity Yet</h3>
            <p>Recent service repairs and maintenance visits will show up here automatically.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Details</th>
                  <th>Vehicle Plate</th>
                  <th>Scheduled Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentServices.map((service, index) => (
                  <tr key={service._id || index}>
                    <td className="index-cell">{index + 1}</td>
                    <td>
                      <div className="service-name-cell">
                        <Wrench size={15} className="table-inline-icon" />
                        <strong>{service.serviceName}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="plate-badge">
                        <CarFront size={12} />
                        {service.vehicleNumber}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(service.serviceDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="amount-cell">
                      ₹{Number(service.serviceCost).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${service.serviceStatus
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <span className="status-dot-sm"></span>
                        {service.serviceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;