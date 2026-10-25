import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  Layers,
  Zap,
  Gauge
} from "lucide-react";

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("all"); // "all", "month", "week", "today"
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "Pending", "In Progress", "Completed"
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [customerRes, vehicleRes, serviceRes] = await Promise.all([
        API.get("/customers").catch(() => ({ data: [] })),
        API.get("/vehicles").catch(() => ({ data: [] })),
        API.get("/services").catch(() => ({ data: [] })),
      ]);

      setCustomers(customerRes.data || []);
      setVehicles(vehicleRes.data || []);
      setServices(serviceRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter services by timeframe if requested
  const filteredServices = useMemo(() => {
    const now = new Date();
    return services.filter((srv) => {
      const srvDate = new Date(srv.createdAt || srv.serviceDate || now);

      if (timeframe === "today") {
        return srvDate.toDateString() === now.toDateString();
      }
      if (timeframe === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return srvDate >= weekAgo;
      }
      if (timeframe === "month") {
        return srvDate.getMonth() === now.getMonth() && srvDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [services, timeframe]);

  // Aggregate Metrics
  const pendingCount = filteredServices.filter((s) => s.serviceStatus === "Pending").length;
  const inProgressCount = filteredServices.filter((s) => s.serviceStatus === "In Progress").length;
  const completedCount = filteredServices.filter((s) => s.serviceStatus === "Completed").length;
  const totalCount = pendingCount + inProgressCount + completedCount;

  // Revenue Calculations
  const completedRevenue = filteredServices
    .filter((s) => s.serviceStatus === "Completed")
    .reduce((acc, curr) => acc + (Number(curr.serviceCost) || 0), 0);

  const pipelineRevenue = filteredServices
    .reduce((acc, curr) => acc + (Number(curr.serviceCost) || 0), 0);

  const averageTicket = completedCount > 0 ? Math.round(completedRevenue / completedCount) : 0;
  const efficiencyRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Search and Status filter for recent table
  const displayedServices = useMemo(() => {
    return services
      .filter((s) => {
        if (statusFilter !== "all" && s.serviceStatus !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchPlate = s.vehicleNumber?.toLowerCase().includes(q);
          const matchName = s.serviceName?.toLowerCase().includes(q);
          const matchNotes = s.description?.toLowerCase().includes(q);
          return matchPlate || matchName || matchNotes;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || b.serviceDate) - new Date(a.createdAt || a.serviceDate))
      .slice(0, 8);
  }, [services, statusFilter, searchQuery]);

  // Workshop Bays Definition with Dynamic Active Status
  const workshopBays = useMemo(() => {
    const activeJobs = services.filter((s) => s.serviceStatus === "In Progress" || s.serviceStatus === "Pending");
    return [
      {
        bayId: "BAY-01",
        name: "General Overhaul Bay",
        category: "Mechanical",
        assignedJob: activeJobs[0] || null,
        defaultStatus: activeJobs[0] ? "Occupied" : "Available",
      },
      {
        bayId: "BAY-02",
        name: "Engine Diagnostics & Lift",
        category: "Diagnostics",
        assignedJob: activeJobs[1] || null,
        defaultStatus: activeJobs[1] ? "Occupied" : "Available",
      },
      {
        bayId: "BAY-03",
        name: "Electrical & AC Testing",
        category: "Electrical",
        assignedJob: activeJobs[2] || null,
        defaultStatus: activeJobs[2] ? "Occupied" : "Available",
      },
      {
        bayId: "BAY-04",
        name: "Brake & Safety Inspection",
        category: "Inspection",
        assignedJob: activeJobs[3] || null,
        defaultStatus: activeJobs[3] ? "Occupied" : "Available",
      },
    ];
  }, [services]);

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <main className="dashboard executive-dashboard">
      {/* =========================================================================
          TOP EXECUTIVE HEADER & COMMAND BAR
         ========================================================================= */}
      <div className="dashboard-header executive-header">
        <div className="header-left">
          <div className="dashboard-pretitle">
            <Zap size={14} className="pulse-icon text-primary-600" />
            <span>Automotive ERP & Workshop Dispatch</span>
          </div>
          <h1 className="page-heading">
            Executive Command Center
          </h1>
          <p className="page-subheading">
            Live bay dispatch, fleet telemetry, active work orders, and financial KPIs
          </p>
        </div>

        <div className="header-actions-group">
          {/* Timeframe Filter Pills */}
          <div className="timeframe-pill-selector">
            <button
              type="button"
              className={`time-pill ${timeframe === "all" ? "active" : ""}`}
              onClick={() => setTimeframe("all")}
            >
              All Time
            </button>
            <button
              type="button"
              className={`time-pill ${timeframe === "month" ? "active" : ""}`}
              onClick={() => setTimeframe("month")}
            >
              This Month
            </button>
            <button
              type="button"
              className={`time-pill ${timeframe === "week" ? "active" : ""}`}
              onClick={() => setTimeframe("week")}
            >
              This Week
            </button>
            <button
              type="button"
              className={`time-pill ${timeframe === "today" ? "active" : ""}`}
              onClick={() => setTimeframe("today")}
            >
              Today
            </button>
          </div>

          <div className="header-buttons-duo">
            {/* Quick Action Buttons */}
            <Link to="/services" className="primary-action-btn header-btn">
              <Plus size={16} />
              <span>New Job Order</span>
            </Link>

            <button
              type="button"
              className="secondary-refresh-btn"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              title="Refresh live workshop feed"
            >
              <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
              <span>{refreshing ? "Syncing..." : "Live Sync"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          EXECUTIVE KPI METRICS GRID (Balanced 3-Column x 2-Row Layout)
         ========================================================================= */}
      <div className="executive-kpi-grid">
        {/* Metric 1: Total Realized Revenue */}
        <div className="kpi-card revenue-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Realized Revenue</span>
            <div className="kpi-icon-wrap emerald">
              <IndianRupee size={22} />
            </div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-primary-val">
              ₹{completedRevenue.toLocaleString("en-IN")}
            </div>
            <div className="kpi-sub-row">
              <span className="kpi-badge positive">
                <TrendingUp size={12} /> Billed Orders
              </span>
              <span className="kpi-secondary-info">
                Pipeline: ₹{pipelineRevenue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Workshop Bays */}
        <div className="kpi-card active-jobs-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Active Work Orders</span>
            <div className="kpi-icon-wrap blue">
              <Wrench size={22} />
            </div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-primary-val">{inProgressCount} Jobs</div>
            <div className="kpi-sub-row">
              <span className="kpi-badge info">
                <Activity size={12} /> Under Maintenance
              </span>
              <span className="kpi-secondary-info">
                In Service Bays
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Intake */}
        <div className="kpi-card pending-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Pending Intake</span>
            <div className="kpi-icon-wrap amber">
              <Clock3 size={22} />
            </div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-primary-val">{pendingCount} Vehicles</div>
            <div className="kpi-sub-row">
              <span className="kpi-badge warning">
                <AlertCircle size={12} /> Queued Up
              </span>
              <span className="kpi-secondary-info">
                Awaiting Bay Lift
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Completed & Delivered */}
        <div className="kpi-card completed-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Completed & Cleared</span>
            <div className="kpi-icon-wrap green">
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-primary-val">{completedCount} Finished</div>
            <div className="kpi-sub-row">
              <span className="kpi-badge success">
                <ShieldCheck size={12} /> Road Tested
              </span>
              <span className="kpi-secondary-info">
                Ready for Pickup
              </span>
            </div>
          </div>
        </div>

        {/* Metric 5: Workshop Efficiency */}
        <div className="kpi-card efficiency-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Turnaround Rate</span>
            <div className="kpi-icon-wrap purple">
              <Gauge size={22} />
            </div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-primary-val">{efficiencyRate}%</div>
            <div className="kpi-sub-row">
              <span className="kpi-badge purple">
                <BarChart3 size={12} /> Target: 85%
              </span>
              <span className="kpi-secondary-info">
                Avg: ₹{averageTicket.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 6: Registered Fleet */}
        <div className="kpi-card fleet-card">
          <div className="kpi-card-header">
            <span className="kpi-label">Registered Fleet</span>
            <div className="kpi-icon-wrap slate">
              <CarFront size={22} />
            </div>
          </div>
          <div className="kpi-card-body">
            <div className="kpi-primary-val">{vehicles.length} Vehicles</div>
            <div className="kpi-sub-row">
              <span className="kpi-badge slate">
                <Users size={12} /> {customers.length} Customers
              </span>
              <Link to="/vehicles" className="kpi-mini-link">
                Fleet Directory →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          WORKSHOP BAY TELEMETRY & PIPELINE ANALYTICS ROW
         ========================================================================= */}
      <div className="dashboard-grid-dual">
        {/* Left: Live Workshop Bays Status */}
        <div className="dashboard-card-panel bay-telemetry-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <div className="panel-icon-badge">
                <Layers size={18} />
              </div>
              <div>
                <h3>Workshop Bay Telemetry</h3>
                <p>Real-time physical garage lifts & mechanic allocation</p>
              </div>
            </div>
            <div className="system-pill" style={{ background: "#f0fdf4" }}>
              <span className="system-status-dot"></span>
              <span>4 Bays Online</span>
            </div>
          </div>

          <div className="bays-grid">
            {workshopBays.map((bay) => (
              <div
                key={bay.bayId}
                className={`bay-card ${bay.assignedJob ? "occupied" : "idle"}`}
              >
                <div className="bay-top-row">
                  <span className="bay-id-tag">{bay.bayId}</span>
                  <span
                    className={`bay-status-chip ${
                      bay.assignedJob?.serviceStatus === "In Progress"
                        ? "in-progress"
                        : bay.assignedJob?.serviceStatus === "Pending"
                        ? "queued"
                        : "available"
                    }`}
                  >
                    <span className="status-dot-sm"></span>
                    {bay.assignedJob ? bay.assignedJob.serviceStatus : "Available"}
                  </span>
                </div>

                <div className="bay-name">{bay.name}</div>
                <div className="bay-category-sub">{bay.category} Division</div>

                {bay.assignedJob ? (
                  <div className="bay-active-job-details">
                    <div className="bay-plate-pill">
                      <CarFront size={14} />
                      <strong>{bay.assignedJob.vehicleNumber}</strong>
                    </div>
                    <div className="bay-job-title" title={bay.assignedJob.serviceName}>
                      {bay.assignedJob.serviceName}
                    </div>
                    <div className="bay-job-cost">
                      ₹{Number(bay.assignedJob.serviceCost).toLocaleString("en-IN")}
                    </div>
                  </div>
                ) : (
                  <div className="bay-empty-state">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Ready for Next Vehicle Intake</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pipeline Progress & Financial Overview */}
        <div className="dashboard-card-panel pipeline-summary-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <div className="panel-icon-badge purple">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3>Service Pipeline Balance</h3>
                <p>Status breakdown & financial distribution</p>
              </div>
            </div>
            <span className="record-count-badge">
              {totalCount} Active Orders
            </span>
          </div>

          <div className="pipeline-body">
            {/* Visual Multi-Segment Progress Bar */}
            <div className="pipeline-multi-bar">
              <div
                className="bar-segment completed"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
                title={`Completed: ${completedCount}`}
              ></div>
              <div
                className="bar-segment progress"
                style={{
                  width: `${totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0}%`,
                }}
                title={`In Progress: ${inProgressCount}`}
              ></div>
              <div
                className="bar-segment pending"
                style={{
                  width: `${totalCount > 0 ? (pendingCount / totalCount) * 100 : 0}%`,
                }}
                title={`Pending: ${pendingCount}`}
              ></div>
            </div>

            {/* Pipeline Stats Breakdown */}
            <div className="pipeline-breakdown-list">
              <div className="breakdown-item">
                <div className="item-label">
                  <span className="legend-dot green"></span>
                  <span>Completed & Invoiced</span>
                </div>
                <div className="item-values">
                  <strong>{completedCount} orders</strong>
                  <span className="item-cost">₹{completedRevenue.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="breakdown-item">
                <div className="item-label">
                  <span className="legend-dot blue"></span>
                  <span>Work In Progress</span>
                </div>
                <div className="item-values">
                  <strong>{inProgressCount} orders</strong>
                  <span className="item-cost">
                    ₹
                    {filteredServices
                      .filter((s) => s.serviceStatus === "In Progress")
                      .reduce((acc, c) => acc + (Number(c.serviceCost) || 0), 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="breakdown-item">
                <div className="item-label">
                  <span className="legend-dot amber"></span>
                  <span>Pending Intake</span>
                </div>
                <div className="item-values">
                  <strong>{pendingCount} orders</strong>
                  <span className="item-cost">
                    ₹
                    {filteredServices
                      .filter((s) => s.serviceStatus === "Pending")
                      .reduce((acc, c) => acc + (Number(c.serviceCost) || 0), 0)
                      .toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Link Card to Customer Portal */}
            <div className="portal-access-callout">
              <div className="callout-content">
                <strong>Customer Live Tracking Portal</strong>
                <p>Public repair tracker with bill & token print formats</p>
              </div>
              <Link to="/" className="portal-external-btn" target="_blank">
                <span>Open Portal</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RECENT SERVICE ORDERS & WORKFLOW DISPATCH TABLE
         ========================================================================= */}
      <div className="dashboard-card-panel recent-orders-panel">
        <div className="table-controls-header">
          <div className="controls-left">
            <div className="panel-title-group">
              <div className="panel-icon-badge">
                <Wrench size={18} />
              </div>
              <div>
                <h3>Recent Service Operations & Work Orders</h3>
                <p>Live mechanic diagnostic entries, scheduled repairs, and billing logs</p>
              </div>
            </div>
          </div>

          <div className="controls-right">
            {/* Real-time search in recent records */}
            <div className="table-search-wrap">
              <Search size={15} className="table-search-icon" />
              <input
                type="text"
                placeholder="Search plate, service or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="table-search-input"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="table-filter-chips">
              <button
                type="button"
                className={`chip-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`chip-btn ${statusFilter === "In Progress" ? "active" : ""}`}
                onClick={() => setStatusFilter("In Progress")}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`chip-btn ${statusFilter === "Pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("Pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={`chip-btn ${statusFilter === "Completed" ? "active" : ""}`}
                onClick={() => setStatusFilter("Completed")}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {displayedServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Wrench size={38} />
            </div>
            <h3>No Service Orders Found</h3>
            <p>
              {searchQuery
                ? `No service entries match your search query "${searchQuery}".`
                : "No active service entries logged yet. Create your first service order to start tracking."}
            </p>
            <Link to="/services" className="primary-action-btn" style={{ marginTop: "14px" }}>
              <Plus size={16} /> Create Service Job
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle Plate</th>
                  <th>Service Performed</th>
                  <th>Diagnostic & Notes</th>
                  <th>Serviced Date</th>
                  <th>Billed Amount</th>
                  <th>Repair Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedServices.map((service, index) => (
                  <tr key={service._id || index}>
                    <td className="index-cell">{index + 1}</td>
                    <td>
                      <span className="plate-badge pro-plate">
                        <CarFront size={13} />
                        <strong>{service.vehicleNumber}</strong>
                      </span>
                    </td>
                    <td>
                      <div className="service-name-cell">
                        <Wrench size={14} className="table-inline-icon" />
                        <strong>{service.serviceName}</strong>
                      </div>
                    </td>
                    <td className="service-notes-cell" style={{ maxWidth: "260px" }}>
                      <span className="text-truncate" title={service.description}>
                        {service.description || "General maintenance and safety road diagnostics."}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(service.serviceDate || service.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
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
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to="/services"
                        className="table-action-link"
                        title="Manage service in service registry"
                      >
                        <span>Manage</span>
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="panel-footer-bar">
          <span className="footer-status-text">
            Showing {displayedServices.length} of {services.length} recorded service orders
          </span>
          <Link to="/history" className="view-all-link">
            <span>View Full Service History Archive</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;