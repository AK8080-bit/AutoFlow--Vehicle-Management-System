import { useEffect, useState } from "react";
import API from "../services/api";
import {
  CarFront,
  PlusCircle,
  Pencil,
  Trash2,
  Calendar,
  Hash,
  User,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  Phone,
  Mail
} from "lucide-react";
import NotificationToast from "../components/NotificationToast";

// Standard Vehicle Types
const VEHICLE_TYPES = [
  "Four Wheeler (Hatchback / Sedan)",
  "Two Wheeler (Motorcycle / Bike)",
  "Two Wheeler (Scooter / Moped)",
  "SUV / MUV / Compact SUV",
  "Electric Vehicle (EV / Hybrid)",
  "Commercial (Van / Pickup / Truck)",
  "Luxury / Sports Car",
  "Three Wheeler (Auto Rickshaw)",
  "Other / Custom Type",
];

// Predefined Popular Models
const POPULAR_MODELS = [
  "Maruti Suzuki Swift",
  "Maruti Suzuki Baleno",
  "Maruti Suzuki Brezza",
  "Maruti Suzuki Dzire",
  "Hyundai Creta",
  "Hyundai i20",
  "Hyundai Venue",
  "Tata Nexon",
  "Tata Punch",
  "Tata Harrier",
  "Mahindra Thar",
  "Mahindra Scorpio-N",
  "Mahindra XUV700",
  "Honda City 1.5",
  "Toyota Innova Crysta",
  "Toyota Fortuner",
  "Kia Seltos",
  "Royal Enfield Classic 350",
  "Royal Enfield Hunter 350",
  "Honda Activa 6G",
  "Hero Splendor Plus",
  "TVS Jupiter 125",
  "Bajaj Pulsar 150",
  "Other / Custom Model",
];

// Predefined Years
const CURRENT_YEAR = new Date().getFullYear();
const REG_YEARS = Array.from({ length: 26 }, (_, i) => CURRENT_YEAR - i);

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isCustomType, setIsCustomType] = useState(false);

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    vehicleType: VEHICLE_TYPES[0],
    model: POPULAR_MODELS[0],
    customerName: "",
    customerId: "",
    registrationYear: String(CURRENT_YEAR),
  });

  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch all vehicles
  const fetchVehicles = async () => {
    try {
      const response = await API.get("/vehicles");
      setVehicles(response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  // Automatically fetch customers from Customer section!
  const fetchCustomers = async () => {
    try {
      const response = await API.get("/customers");
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchCustomers();
  }, []);

  // Handle customer selection from auto-fetched dropdown
  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);

    if (!custId) {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
      }));
      return;
    }

    if (custId === "custom") {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: "",
      }));
      return;
    }

    const matched = customers.find((c) => c._id === custId);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        customerId: matched._id,
        customerName: matched.name,
      }));
      setErrors((prev) => ({
        ...prev,
        customerName: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "modelSelect") {
      if (value === "Other / Custom Model") {
        setIsCustomModel(true);
        setFormData((prev) => ({ ...prev, model: "" }));
      } else {
        setIsCustomModel(false);
        setFormData((prev) => ({ ...prev, model: value }));
      }
      return;
    }

    if (name === "typeSelect") {
      if (value === "Other / Custom Type") {
        setIsCustomType(true);
        setFormData((prev) => ({ ...prev, vehicleType: "" }));
      } else {
        setIsCustomType(false);
        setFormData((prev) => ({ ...prev, vehicleType: value }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const vehicleNumber = formData.vehicleNumber.trim().toUpperCase();
    const vehicleType = formData.vehicleType.trim();
    const model = formData.model.trim();
    const customerName = formData.customerName.trim();
    const registrationYear = Number(formData.registrationYear);

    if (!vehicleNumber) {
      newErrors.vehicleNumber = "Vehicle number is required";
    } else if (!/^[A-Z0-9- ]{5,14}$/.test(vehicleNumber)) {
      newErrors.vehicleNumber = "Enter a valid vehicle plate (e.g. MH20AB1234)";
    }

    if (!vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }

    if (!model) {
      newErrors.model = "Vehicle model is required";
    }

    if (!customerName) {
      newErrors.customerName = "Customer name is required. Select from dropdown or type new name.";
    }

    if (!formData.registrationYear) {
      newErrors.registrationYear = "Registration year is required";
    } else if (
      isNaN(registrationYear) ||
      registrationYear < 1950 ||
      registrationYear > CURRENT_YEAR
    ) {
      newErrors.registrationYear = `Year must be between 1950 and ${CURRENT_YEAR}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const cleanedData = {
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        vehicleType: formData.vehicleType.trim(),
        model: formData.model.trim(),
        customerName: formData.customerName.trim(),
        customerId: formData.customerId || undefined,
        registrationYear: Number(formData.registrationYear),
      };

      if (editId) {
        await API.put(`/vehicles/${editId}`, cleanedData);
        setNotification({
          type: "success",
          title: "Vehicle Updated Successfully",
          message: `Vehicle ${cleanedData.vehicleNumber} specifications have been updated.`,
        });
      } else {
        await API.post("/vehicles", cleanedData);
        setNotification({
          type: "success",
          title: "Vehicle Enrolled Successfully",
          message: `Vehicle ${cleanedData.vehicleNumber} added to fleet with owner ${cleanedData.customerName}.`,
        });
      }

      setFormData({
        vehicleNumber: "",
        vehicleType: VEHICLE_TYPES[0],
        model: POPULAR_MODELS[0],
        customerName: "",
        customerId: "",
        registrationYear: String(CURRENT_YEAR),
      });
      setSelectedCustomerId("");
      setIsCustomModel(false);
      setIsCustomType(false);
      setErrors({});
      setEditId(null);
      fetchVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      setNotification({
        type: "error",
        title: "Submission Error",
        message: error.response?.data?.message || "Failed to save vehicle data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      customerName: vehicle.customerName,
      customerId: vehicle.customerId?._id || vehicle.customerId || "",
      registrationYear: String(vehicle.registrationYear),
    });

    if (vehicle.customerId?._id || vehicle.customerId) {
      setSelectedCustomerId(vehicle.customerId?._id || vehicle.customerId);
    } else {
      setSelectedCustomerId("custom");
    }

    setIsCustomModel(!POPULAR_MODELS.includes(vehicle.model));
    setIsCustomType(!VEHICLE_TYPES.includes(vehicle.vehicleType));
    setErrors({});
    setEditId(vehicle._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this vehicle?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/vehicles/${id}`);
      setNotification({
        type: "info",
        title: "Vehicle Deleted",
        message: "Vehicle record removed from the fleet system.",
      });
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      setNotification({
        type: "error",
        title: "Delete Failed",
        message: error.response?.data?.message || "Could not delete vehicle.",
      });
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setErrors({});
    setSelectedCustomerId("");
    setIsCustomModel(false);
    setIsCustomType(false);
    setFormData({
      vehicleNumber: "",
      vehicleType: VEHICLE_TYPES[0],
      model: POPULAR_MODELS[0],
      customerName: "",
      customerId: "",
      registrationYear: String(CURRENT_YEAR),
    });
  };

  // Find currently selected customer info
  const activeCustomer = customers.find((c) => c._id === selectedCustomerId);

  return (
    <main className="dashboard">
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      <div className="dashboard-header">
        <div>
          <div className="dashboard-pretitle">
            <CarFront size={14} className="pulse-icon" /> Fleet & Vehicle Registry
          </div>
          <h1 className="page-heading">Vehicle Management</h1>
          <p className="page-subheading">
            Register cars & two-wheelers, auto-link customers, and select models with smart dropdowns
          </p>
        </div>
        <div className="dashboard-header-right">
          <span className="record-count-badge">
            <CarFront size={14} />
            {vehicles.length} Enrolled {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
          </span>
        </div>
      </div>

      {/* Vehicle Form Card */}
      <div className="customer-form form-panel">
        <div className="form-panel-header">
          <div className="form-panel-icon purple">
            {editId ? <Pencil size={20} /> : <PlusCircle size={20} />}
          </div>
          <div>
            <h2>{editId ? "Update Vehicle Information" : "Register New Vehicle"}</h2>
            <p className="form-panel-subtext">
              {editId
                ? "Edit license plate, specs, and linked customer profile"
                : "Select an existing customer from the dropdown to automatically fetch owner data"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-form-grid">
          {/* Customer Selection Dropdown (Auto-Fetched from Customer Section) */}
          <div className="input-group-modern full-span">
            <label className="input-label">
              <User size={14} /> Link Registered Customer (Auto-Fetched) <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                className="pro-select-dropdown"
              >
                <option value="">-- Choose a Registered Customer ({customers.length} available) --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} • {c.phone} {c.email ? `(${c.email})` : ""}
                  </option>
                ))}
                <option value="custom">+ Type New / Custom Customer Name</option>
              </select>
            </div>

            {/* If Customer is selected from dropdown, show auto-fetch confirmation card */}
            {activeCustomer && (
              <div className="auto-fetch-info-box" style={{ marginTop: "10px" }}>
                <div className="auto-fetch-info-content">
                  <CheckCircle2 size={18} className="auto-fetch-icon" />
                  <div>
                    <div className="auto-fetch-title">Auto-Linked: {activeCustomer.name}</div>
                    <div className="auto-fetch-subtitle">
                      <Phone size={11} style={{ verticalAlign: "middle", marginRight: "3px" }} />
                      {activeCustomer.phone} |{" "}
                      <Mail size={11} style={{ verticalAlign: "middle", marginRight: "3px" }} />
                      {activeCustomer.email || "No email"}
                    </div>
                  </div>
                </div>
                <span className="system-pill" style={{ fontSize: "11px" }}>Customer Synced</span>
              </div>
            )}

            {/* If user picked custom or no customer exists yet */}
            {(selectedCustomerId === "custom" || (!selectedCustomerId && !customers.length)) && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Enter Customer Full Name"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={errors.customerName ? "has-error" : ""}
                />
              </div>
            )}

            {errors.customerName && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.customerName}
              </p>
            )}
          </div>

          {/* License Plate Number */}
          <div className="input-group-modern">
            <label className="input-label">
              <Hash size={14} /> License Plate Number <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="text"
                name="vehicleNumber"
                placeholder="e.g. MH20AB1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                maxLength="12"
                style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}
                className={errors.vehicleNumber ? "has-error" : ""}
              />
            </div>
            {errors.vehicleNumber && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.vehicleNumber}
              </p>
            )}
          </div>

          {/* Vehicle Category / Type (Dropdown) */}
          <div className="input-group-modern">
            <label className="input-label">
              <CarFront size={14} /> Vehicle Category / Type <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                name="typeSelect"
                value={isCustomType ? "Other / Custom Type" : formData.vehicleType}
                onChange={handleChange}
                className="pro-select-dropdown"
              >
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {isCustomType && (
              <div style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  name="vehicleType"
                  placeholder="Type vehicle category (e.g. Vintage Roadster)"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className={errors.vehicleType ? "has-error" : ""}
                />
              </div>
            )}
            {errors.vehicleType && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.vehicleType}
              </p>
            )}
          </div>

          {/* Make & Model (Dropdown with custom option) */}
          <div className="input-group-modern">
            <label className="input-label">
              <Tag size={14} /> Make & Model <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                name="modelSelect"
                value={isCustomModel ? "Other / Custom Model" : formData.model}
                onChange={handleChange}
                className="pro-select-dropdown"
              >
                {POPULAR_MODELS.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            {isCustomModel && (
              <div style={{ marginTop: "8px" }}>
                <input
                  type="text"
                  name="model"
                  placeholder="Type make & model (e.g. BMW 320d M-Sport)"
                  value={formData.model}
                  onChange={handleChange}
                  className={errors.model ? "has-error" : ""}
                />
              </div>
            )}
            {errors.model && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.model}
              </p>
            )}
          </div>

          {/* Registration Year (Dropdown) */}
          <div className="input-group-modern">
            <label className="input-label">
              <Calendar size={14} /> Manufacturing / Reg. Year <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                name="registrationYear"
                value={formData.registrationYear}
                onChange={handleChange}
                className="pro-select-dropdown"
              >
                {REG_YEARS.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
            {errors.registrationYear && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.registrationYear}
              </p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="form-action-row">
            <button type="submit" className="primary-action-btn" disabled={loading}>
              {editId ? <CheckCircle2 size={16} /> : <PlusCircle size={16} />}
              <span>{editId ? "Update Vehicle Record" : "Enroll Vehicle"}</span>
            </button>

            {editId && (
              <button
                type="button"
                className="secondary-cancel-btn"
                onClick={handleCancel}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Enrolled Vehicles Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <h3>Enrolled Fleet Vehicles ({vehicles.length})</h3>
        </div>

        {vehicles.length === 0 ? (
          <div className="empty-state">
            <CarFront size={48} className="empty-icon" />
            <p className="empty-text">No vehicles enrolled yet.</p>
            <p className="empty-subtext">
              Use the form above to enroll your first customer vehicle.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Vehicle Plate</th>
                  <th>Model & Specs</th>
                  <th>Category</th>
                  <th>Customer Owner</th>
                  <th>Year</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <span className="plate-badge">{v.vehicleNumber}</span>
                    </td>
                    <td>
                      <div className="model-cell">
                        <span className="model-name">{v.model}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{v.vehicleType}</span>
                    </td>
                    <td>
                      <div className="customer-info-cell">
                        <span className="customer-name">{v.customerName}</span>
                        {v.customerEmail && (
                          <span className="customer-email" style={{ fontSize: "11px", color: "#64748b" }}>
                            {v.customerEmail}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="year-pill">{v.registrationYear}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn edit-btn"
                          onClick={() => handleEdit(v)}
                          title="Edit Vehicle"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => handleDelete(v._id)}
                          title="Delete Vehicle"
                        >
                          <Trash2 size={15} />
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
    </main>
  );
}

export default Vehicles;