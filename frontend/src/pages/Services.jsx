import { useEffect, useState } from "react";

import API from "../services/api";

function Services() {
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    serviceName: "",
    vehicleNumber: "",
    serviceDate: "",
    serviceCost: "",
    serviceStatus: "Pending",
    description: "",
  });

  const [editId, setEditId] = useState(null);

  const [errors, setErrors] = useState({});

  // Fetch all services
  const fetchServices = async () => {
    try {
      const response = await API.get("/services");

      setServices(response.data);
    } catch (error) {
      console.error(
        "Error fetching services:",
        error
      );
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Remove error when user corrects the field
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // Validate service form
  const validateForm = () => {
    const newErrors = {};

    const serviceName =
      formData.serviceName.trim();

    const vehicleNumber =
      formData.vehicleNumber
        .trim()
        .toUpperCase();

    const serviceDate =
      formData.serviceDate;

    const serviceCost =
      Number(formData.serviceCost);

    const serviceStatus =
      formData.serviceStatus;

    const description =
      formData.description.trim();

    const today = new Date()
      .toISOString()
      .split("T")[0];

    // Service Name
    if (!serviceName) {
      newErrors.serviceName =
        "Service name is required";
    } else if (serviceName.length < 2) {
      newErrors.serviceName =
        "Service name must contain at least 2 characters";
    }

    // Vehicle Number
    if (!vehicleNumber) {
      newErrors.vehicleNumber =
        "Vehicle number is required";
    } else if (
      !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(
        vehicleNumber
      )
    ) {
      newErrors.vehicleNumber =
        "Enter a valid vehicle number, e.g. MH20AB1234";
    }

    // Service Date
    if (!serviceDate) {
      newErrors.serviceDate =
        "Service date is required";
    } else if (serviceDate > today) {
      newErrors.serviceDate =
        "Service date cannot be a future date";
    }

    // Service Cost
    if (!formData.serviceCost) {
      newErrors.serviceCost =
        "Service cost is required";
    } else if (
      Number.isNaN(serviceCost) ||
      serviceCost <= 0
    ) {
      newErrors.serviceCost =
        "Service cost must be greater than 0";
    }

    // Service Status
    if (
      ![
        "Pending",
        "In Progress",
        "Completed",
      ].includes(serviceStatus)
    ) {
      newErrors.serviceStatus =
        "Please select a valid service status";
    }

    // Description
    if (!description) {
      newErrors.description =
        "Description is required";
    } else if (description.length < 5) {
      newErrors.description =
        "Description must contain at least 5 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Add / Update service
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validateForm()) {
      return;
    }

    try {
      const cleanedData = {
        serviceName:
          formData.serviceName.trim(),

        vehicleNumber:
          formData.vehicleNumber
            .trim()
            .toUpperCase(),

        serviceDate:
          formData.serviceDate,

        serviceCost:
          Number(formData.serviceCost),

        serviceStatus:
          formData.serviceStatus,

        description:
          formData.description.trim(),
      };

      if (editId) {
        await API.put(
          `/services/${editId}`,
          cleanedData
        );

        alert("Service updated successfully!");
      } else {
        await API.post(
          "/services",
          cleanedData
        );

        alert("Service added successfully!");
      }

      fetchServices();

      setFormData({
        serviceName: "",
        vehicleNumber: "",
        serviceDate: "",
        serviceCost: "",
        serviceStatus: "Pending",
        description: "",
      });

      setErrors({});

      setEditId(null);
    } catch (error) {
      console.error(
        "Error saving service:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Something went wrong!"
      );
    }
  };

  // Edit service
  const handleEdit = (service) => {
    setFormData({
      serviceName: service.serviceName,

      vehicleNumber:
        service.vehicleNumber,

      serviceDate: service.serviceDate
        ? service.serviceDate.split("T")[0]
        : "",

      serviceCost: service.serviceCost,

      serviceStatus:
        service.serviceStatus,

      description: service.description,
    });

    setErrors({});

    setEditId(service._id);
  };

  // Delete service
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/services/${id}`);

      alert("Service deleted successfully!");

      fetchServices();
    } catch (error) {
      console.error(
        "Error deleting service:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Something went wrong!"
      );
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setEditId(null);

    setErrors({});

    setFormData({
      serviceName: "",
      vehicleNumber: "",
      serviceDate: "",
      serviceCost: "",
      serviceStatus: "Pending",
      description: "",
    });
  };

  return (
    <main className="dashboard">
      <h1>Service Management</h1>

      {/* Service Form */}

      <div className="customer-form">
        <h2>
          {editId
            ? "✏️ Edit Service"
            : "🔧 Add Service"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Service Name */}

          <input
            type="text"
            name="serviceName"
            placeholder="Service Name"
            value={formData.serviceName}
            onChange={handleChange}
          />

          {errors.serviceName && (
            <p className="form-error">
              {errors.serviceName}
            </p>
          )}

          {/* Vehicle Number */}

          <input
            type="text"
            name="vehicleNumber"
            placeholder="Vehicle Number (MH20AB1234)"
            value={formData.vehicleNumber}
            onChange={handleChange}
            maxLength="10"
          />

          {errors.vehicleNumber && (
            <p className="form-error">
              {errors.vehicleNumber}
            </p>
          )}

          {/* Service Date */}

          <input
            type="date"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={handleChange}
            max={
              new Date()
                .toISOString()
                .split("T")[0]
            }
          />

          {errors.serviceDate && (
            <p className="form-error">
              {errors.serviceDate}
            </p>
          )}

          {/* Service Cost */}

          <input
            type="number"
            name="serviceCost"
            placeholder="Service Cost"
            value={formData.serviceCost}
            onChange={handleChange}
            min="1"
            step="0.01"
          />

          {errors.serviceCost && (
            <p className="form-error">
              {errors.serviceCost}
            </p>
          )}

          {/* Service Status */}

          <select
            name="serviceStatus"
            value={formData.serviceStatus}
            onChange={handleChange}
          >
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

          {errors.serviceStatus && (
            <p className="form-error">
              {errors.serviceStatus}
            </p>
          )}

          {/* Description */}

          <input
            type="text"
            name="description"
            placeholder="Service Description"
            value={formData.description}
            onChange={handleChange}
          />

          {errors.description && (
            <p className="form-error">
              {errors.description}
            </p>
          )}

          <button type="submit">
            {editId
              ? "Update Service"
              : "Add Service"}
          </button>

          {editId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Service List */}

      <div className="customer-list">
        <h2>🔧 Service List</h2>

        {services.length === 0 ? (
          <p>No services added yet.</p>
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
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {services.map(
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
                      {service.description}
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(service)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            service._id
                          )
                        }
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default Services;