import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Clock3,
  Search,
  Filter,
  Eye,
  X,
  CarFront,
  Calendar,
  IndianRupee,
  FileText,
  Wrench,
  CheckCircle2,
  Sparkles,
  Layers
} from "lucide-react";

function ServiceHistory() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async () => {
    try {
      const response = await API.get("/services");
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching service history:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Search + Filter
  const filteredServices = services.filter((service) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (service.serviceName || "").toLowerCase().includes(searchText) ||
      (service.vehicleNumber || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || service.serviceStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-pretitle">
            <Clock3 size={14} className="pulse-icon" /> Archival & Auditing
          </div>
          <h1 className="page-heading">Service History & Audits</h1>
          <p className="page-subheading">
            Search comprehensive repair records, verify historical billings, and inspect service logs
          </p>
        </div>
        <div className="dashboard-header-right">
          <span className="record-count-badge">
            <Layers size={14} />
            {filteredServices.length} of {services.length} Records Shown
          </span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="history-filter-card">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by service title or license plate (e.g. Oil change or MH20)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-search-btn"
              onClick={() => setSearch("")}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdown-wrap">
          <Filter size={16} className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Service List */}
      <div className="customer-list">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-icon-badge">
              <Clock3 size={18} />
            </div>
            <div>
              <h2>Archived Service Log</h2>
              <p className="section-subtext">Click on any entry to review technician notes and pricing breakdowns</p>
            </div>
          </div>
          <span className="record-count-badge">
            {filteredServices.length} Results
          </span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={38} />
            </div>
            <h3>No Matching Records Found</h3>
            <p>Try modifying your search keywords or switching the status filter.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service Performed</th>
                  <th>Vehicle Plate</th>
                  <th>Service Date</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service, index) => (
                  <tr key={service._id || index}>
                    <td className="index-cell">{index + 1}</td>
                    <td>
                      <div className="service-name-cell">
                        <Wrench size={14} className="table-inline-icon" />
                        <strong>{service.serviceName}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="plate-badge bold">
                        <CarFront size={12} />
                        {service.vehicleNumber}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(service.serviceDate).toLocaleDateString("en-US", {
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
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="action-icon-btn view"
                          onClick={() => setSelectedService(service)}
                          title="View Details"
                        >
                          <Eye size={15} />
                          <span>View Ticket</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="service-modal modern-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Wrench size={20} />
                </div>
                <div>
                  <h2>Service Work Order Details</h2>
                  <span className="modal-subtitle">Official Repair Voucher</span>
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() => setSelectedService(null)}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-status-banner">
              <div className="modal-status-title">Status:</div>
              <span
                className={`status-badge ${selectedService.serviceStatus
                  ?.toLowerCase()
                  .replace(" ", "-")}`}
              >
                <span className="status-dot-sm"></span>
                {selectedService.serviceStatus}
              </span>
            </div>

            <div className="service-details modern-details-grid">
              <div className="detail-item-box">
                <span className="detail-item-label">
                  <Wrench size={13} /> Service Title
                </span>
                <strong className="detail-item-val">{selectedService.serviceName}</strong>
              </div>

              <div className="detail-item-box">
                <span className="detail-item-label">
                  <CarFront size={13} /> Vehicle Registration
                </span>
                <strong className="detail-item-val plate-badge bold">
                  {selectedService.vehicleNumber}
                </strong>
              </div>

              <div className="detail-item-box">
                <span className="detail-item-label">
                  <Calendar size={13} /> Serviced Date
                </span>
                <strong className="detail-item-val">
                  {new Date(selectedService.serviceDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </div>

              <div className="detail-item-box">
                <span className="detail-item-label">
                  <IndianRupee size={13} /> Total Amount Charged
                </span>
                <strong className="detail-item-val amount-highlight">
                  ₹{Number(selectedService.serviceCost).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="detail-item-box full-span">
                <span className="detail-item-label">
                  <FileText size={13} /> Service Diagnostic Notes
                </span>
                <p className="detail-description-text">
                  {selectedService.description || "No supplementary technician remarks recorded."}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-cancel-btn"
                onClick={() => setSelectedService(null)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ServiceHistory;