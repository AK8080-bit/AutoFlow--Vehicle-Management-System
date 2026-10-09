import { useEffect, useState } from "react";

import API from "../services/api";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: "",
    model: "",
    customerName: "",
    registrationYear: "",
  });

  const [editId, setEditId] = useState(null);

  const [errors, setErrors] = useState({});

  // Get all vehicles from MongoDB
  const fetchVehicles = async () => {
    try {
      const response = await API.get("/vehicles");

      setVehicles(response.data);
    } catch (error) {
      console.error(
        "Error fetching vehicles:",
        error
      );
    }
  };

  // Load vehicles when page opens
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle input
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

  // Validate vehicle form
  const validateForm = () => {
    const newErrors = {};

    const vehicleNumber =
      formData.vehicleNumber.trim().toUpperCase();

    const vehicleType =
      formData.vehicleType.trim();

    const model = formData.model.trim();

    const customerName =
      formData.customerName.trim();

    const registrationYear =
      Number(formData.registrationYear);

    const currentYear = new Date().getFullYear();

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

    // Vehicle Type
    if (!vehicleType) {
      newErrors.vehicleType =
        "Vehicle type is required";
    } else if (vehicleType.length < 2) {
      newErrors.vehicleType =
        "Vehicle type must contain at least 2 characters";
    }

    // Model
    if (!model) {
      newErrors.model = "Vehicle model is required";
    } else if (model.length < 2) {
      newErrors.model =
        "Model must contain at least 2 characters";
    }

    // Customer Name
    if (!customerName) {
      newErrors.customerName =
        "Customer name is required";
    } else if (customerName.length < 2) {
      newErrors.customerName =
        "Customer name must contain at least 2 characters";
    }

    // Registration Year
    if (!formData.registrationYear) {
      newErrors.registrationYear =
        "Registration year is required";
    } else if (
      registrationYear < 1950 ||
      registrationYear > currentYear
    ) {
      newErrors.registrationYear =
        `Year must be between 1950 and ${currentYear}`;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Add / Update Vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validateForm()) {
      return;
    }

    try {
      const cleanedData = {
        vehicleNumber:
          formData.vehicleNumber
            .trim()
            .toUpperCase(),

        vehicleType:
          formData.vehicleType.trim(),

        model: formData.model.trim(),

        customerName:
          formData.customerName.trim(),

        registrationYear: Number(
          formData.registrationYear
        ),
      };

      if (editId) {
        // Update vehicle
        await API.put(
          `/vehicles/${editId}`,
          cleanedData
        );

        alert("Vehicle updated successfully!");
      } else {
        // Add vehicle
        await API.post(
          "/vehicles",
          cleanedData
        );

        alert("Vehicle added successfully!");
      }

      // Refresh vehicle list
      fetchVehicles();

      // Clear form
      setFormData({
        vehicleNumber: "",
        vehicleType: "",
        model: "",
        customerName: "",
        registrationYear: "",
      });

      setErrors({});

      setEditId(null);
    } catch (error) {
      console.error(
        "Error saving vehicle:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Something went wrong!"
      );
    }
  };

  // Edit vehicle
  const handleEdit = (vehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      customerName: vehicle.customerName,
      registrationYear: vehicle.registrationYear,
    });

    setErrors({});

    setEditId(vehicle._id);
  };

  // Delete vehicle
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/vehicles/${id}`);

      alert("Vehicle deleted successfully!");

      // Refresh list
      fetchVehicles();
    } catch (error) {
      console.error(
        "Error deleting vehicle:",
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
      vehicleNumber: "",
      vehicleType: "",
      model: "",
      customerName: "",
      registrationYear: "",
    });
  };

  return (
    <main className="dashboard">
      <h1>Vehicle Management</h1>

      {/* Vehicle Form */}

      <div className="customer-form">
        <h2>
          {editId
            ? "✏️ Edit Vehicle"
            : "🚗 Add Vehicle"}
        </h2>

        <form onSubmit={handleSubmit}>
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

          {/* Vehicle Type */}

          <input
            type="text"
            name="vehicleType"
            placeholder="Vehicle Type (Car / Bike)"
            value={formData.vehicleType}
            onChange={handleChange}
          />

          {errors.vehicleType && (
            <p className="form-error">
              {errors.vehicleType}
            </p>
          )}

          {/* Model */}

          <input
            type="text"
            name="model"
            placeholder="Vehicle Model"
            value={formData.model}
            onChange={handleChange}
          />

          {errors.model && (
            <p className="form-error">
              {errors.model}
            </p>
          )}

          {/* Customer Name */}

          <input
            type="text"
            name="customerName"
            placeholder="Customer Name"
            value={formData.customerName}
            onChange={handleChange}
          />

          {errors.customerName && (
            <p className="form-error">
              {errors.customerName}
            </p>
          )}

          {/* Registration Year */}

          <input
            type="number"
            name="registrationYear"
            placeholder="Registration Year"
            value={formData.registrationYear}
            onChange={handleChange}
            min="1950"
            max={new Date().getFullYear()}
          />

          {errors.registrationYear && (
            <p className="form-error">
              {errors.registrationYear}
            </p>
          )}

          <button type="submit">
            {editId
              ? "Update Vehicle"
              : "Add Vehicle"}
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

      {/* Vehicle List */}

      <div className="customer-list">
        <h2>🚗 Vehicle List</h2>

        {vehicles.length === 0 ? (
          <p>No vehicles added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle Number</th>
                <th>Type</th>
                <th>Model</th>
                <th>Customer</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map(
                (vehicle, index) => (
                  <tr key={vehicle._id}>
                    <td>{index + 1}</td>

                    <td>
                      {vehicle.vehicleNumber}
                    </td>

                    <td>
                      {vehicle.vehicleType}
                    </td>

                    <td>{vehicle.model}</td>

                    <td>
                      {vehicle.customerName}
                    </td>

                    <td>
                      {vehicle.registrationYear}
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(vehicle)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            vehicle._id
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

export default Vehicles;