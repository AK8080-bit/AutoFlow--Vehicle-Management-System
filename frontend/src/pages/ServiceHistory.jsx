import { useEffect, useState } from "react";

import API from "../services/api";

function ServiceHistory() {
  const [services, setServices] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedService, setSelectedService] =
    useState(null);

  const fetchServices = async () => {
    try {
      const response = await API.get("/services");

      setServices(response.data);
    } catch (error) {
      console.error(
        "Error fetching service history:",
        error
      );
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Search + Filter
  const filteredServices = services.filter((service) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      service.serviceName
        .toLowerCase()
        .includes(searchText) ||
      service.vehicleNumber
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      service.serviceStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="dashboard">
      <h1>Service History</h1>

      {/* Search and Filter */}
      <div className="history-filter">
        <input
          type="text"
          placeholder="🔍 Search service or vehicle number"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>
      </div>

      {/* Service List */}
      <div className="customer-list">
        <h2>📋 Service History List</h2>

        {filteredServices.length === 0 ? (
          <p>No service history found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Service Name</th>
                <th>Vehicle Number</th>
                <th>Service Date</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map(
                (service, index) => (
                  <tr key={service._id}>
                    <td>{index + 1}</td>

                    <td>
                      {service.serviceName}
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

                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          setSelectedService(service)
                        }
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedService(null)
          }
        >
          <div
            className="service-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <h2>🔧 Service Details</h2>

              <button
                className="modal-close"
                onClick={() =>
                  setSelectedService(null)
                }
              >
                ✕
              </button>
            </div>

            <div className="service-details">
              <div className="detail-item">
                <span>Service Name</span>
                <strong>
                  {selectedService.serviceName}
                </strong>
              </div>

              <div className="detail-item">
                <span>Vehicle Number</span>
                <strong>
                  {selectedService.vehicleNumber}
                </strong>
              </div>

              <div className="detail-item">
                <span>Service Date</span>
                <strong>
                  {new Date(
                    selectedService.serviceDate
                  ).toLocaleDateString()}
                </strong>
              </div>

              <div className="detail-item">
                <span>Service Cost</span>
                <strong>
                  ₹{selectedService.serviceCost}
                </strong>
              </div>

              <div className="detail-item">
                <span>Status</span>

                <strong>
                  <span
                    className={`status-badge ${
                      selectedService.serviceStatus
                        .toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {selectedService.serviceStatus}
                  </span>
                </strong>
              </div>

              <div className="detail-item description-item">
                <span>Description</span>

                <p>
                  {selectedService.description}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="close-modal-btn"
                onClick={() =>
                  setSelectedService(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ServiceHistory;