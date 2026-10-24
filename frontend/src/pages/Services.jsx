import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Wrench,
  PlusCircle,
  Pencil,
  Trash2,
  CarFront,
  Calendar,
  IndianRupee,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  User,
  Phone,
  Mail
} from "lucide-react";
import NotificationToast from "../components/NotificationToast";

// Standard Service Types with Recommended Notes
const STANDARD_SERVICES = [
  {
    name: "General Full Service & Multi-Point Inspection",
    cost: "3500",
    desc: "Complete 40-point vehicle inspection, engine oil check, fluid top-up, spark plugs inspection, brake check and basic wash.",
  },
  {
    name: "Periodic Engine Oil & Filter Flush",
    cost: "1800",
    desc: "Synthetic engine oil replacement, genuine oil filter install, engine bay air blow and fluid levels top-up.",
  },
  {
    name: "Brake Pad Inspection & Disc Rotor Service",
    cost: "2200",
    desc: "Front and rear brake calipers cleaning, brake pads wear measurement, rotor skimming, and DOT4 brake fluid flush.",
  },
  {
    name: "Wheel Alignment, Balancing & Tire Rotation",
    cost: "950",
    desc: "Computerized 3D wheel alignment, dynamic wheel weight balancing, tire tread depth analysis and pressure calibration.",
  },
  {
    name: "Air Conditioning (AC) Gas Refill & Cooling Clean",
    cost: "2400",
    desc: "Cabin pollen filter cleaning/replacement, condenser coil wash, refrigerant R134a pressure refill, and anti-bacterial ozone treatment.",
  },
  {
    name: "Battery Diagnostics & Health Replacement",
    cost: "4500",
    desc: "Battery cranking voltage test, alternator charging rate verification, terminal corrosion cleaning and new battery setup.",
  },
  {
    name: "Suspension & Shock Absorber Overhaul",
    cost: "5200",
    desc: "Inspection of struts, lower arms, ball joints, tie rod ends, and bushing replacements with road test.",
  },
  {
    name: "Full Body Wash, Foam Bath & Interior Detailing",
    cost: "1200",
    desc: "High-pressure underbody rinse, dual-action snow foam wash, interior vacuuming, dashboard polish and tire dressing.",
  },
  {
    name: "Electrical Wiring & ECU Scanner Diagnostics",
    cost: "1500",
    desc: "OBD-II computer diagnostics scan, clearing error trouble codes (DTC), checking sensor signals and battery health.",
  },
  {
    name: "Custom Service / Major Repair",
    cost: "",
    desc: "",
  },
];

const COST_PRESETS = [500, 1200, 2500, 4500, 8000, 12500];

function Services() {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isCustomService, setIsCustomService] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    serviceName: STANDARD_SERVICES[0].name,
    vehicleNumber: "",
    serviceDate: todayStr,
    serviceCost: STANDARD_SERVICES[0].cost,
    serviceStatus: "Pending",
    description: STANDARD_SERVICES[0].desc,
  });

  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch all services
  const fetchServices = async () => {
    try {
      const response = await API.get("/services");
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Automatically fetch enrolled vehicles from Vehicles section!
  const fetchVehicles = async () => {
    try {
      const response = await API.get("/vehicles");
      setVehicles(response.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  // When admin selects a vehicle from the dropdown, auto-fill plate and link info
  const handleVehicleSelect = (e) => {
    const val = e.target.value;
    setSelectedVehicleId(val);

    if (!val || val === "custom") {
      if (val === "custom") {
        setFormData((prev) => ({ ...prev, vehicleNumber: "" }));
      }
      return;
    }

    const matched = vehicles.find((v) => v._id === val);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        vehicleNumber: matched.vehicleNumber,
      }));
      setErrors((prev) => ({
        ...prev,
        vehicleNumber: "",
      }));
    }
  };

  // When admin selects a standard service type from dropdown
  const handleServiceTypeSelect = (e) => {
    const val = e.target.value;
    if (val === "Custom Service / Major Repair") {
      setIsCustomService(true);
      setFormData((prev) => ({
        ...prev,
        serviceName: "",
        serviceCost: "",
        description: "",
      }));
    } else {
      setIsCustomService(false);
      const matched = STANDARD_SERVICES.find((s) => s.name === val);
      if (matched) {
        setFormData((prev) => ({
          ...prev,
          serviceName: matched.name,
          serviceCost: matched.cost,
          description: matched.desc,
        }));
      }
    }
    setErrors((prev) => ({
      ...prev,
      serviceName: "",
      serviceCost: "",
      description: "",
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const applyCostPreset = (amount) => {
    setFormData((prev) => ({
      ...prev,
      serviceCost: String(amount),
    }));
    setErrors((prev) => ({
      ...prev,
      serviceCost: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const serviceName = formData.serviceName.trim();
    const vehicleNumber = formData.vehicleNumber.trim().toUpperCase();
    const serviceDate = formData.serviceDate;
    const serviceCost = Number(formData.serviceCost);
    const serviceStatus = formData.serviceStatus;
    const description = formData.description.trim();

    if (!serviceName) {
      newErrors.serviceName = "Service name is required";
    }

    if (!vehicleNumber) {
      newErrors.vehicleNumber = "Vehicle plate is required. Select from the dropdown or type plate.";
    }

    if (!serviceDate) {
      newErrors.serviceDate = "Service date is required";
    }

    if (!formData.serviceCost) {
      newErrors.serviceCost = "Service cost is required";
    } else if (isNaN(serviceCost) || serviceCost <= 0) {
      newErrors.serviceCost = "Cost must be a valid number greater than 0";
    }

    if (!serviceStatus) {
      newErrors.serviceStatus = "Please select a service status";
    }

    if (!description) {
      newErrors.description = "Description is required";
    } else if (description.length < 5) {
      newErrors.description = "Description must contain at least 5 characters";
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
        serviceName: formData.serviceName.trim(),
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        serviceDate: formData.serviceDate,
        serviceCost: Number(formData.serviceCost),
        serviceStatus: formData.serviceStatus,
        description: formData.description.trim(),
      };

      if (editId) {
        await API.put(`/services/${editId}`, cleanedData);
        setNotification({
          type: "success",
          title: "Work Order Updated",
          message: `Service ticket for ${cleanedData.vehicleNumber} successfully updated.`,
        });
      } else {
        await API.post("/services", cleanedData);
        setNotification({
          type: "success",
          title: "Service Order Created",
          message: `New service order for ${cleanedData.vehicleNumber} (${cleanedData.serviceName}) created.`,
        });
      }

      setFormData({
        serviceName: STANDARD_SERVICES[0].name,
        vehicleNumber: "",
        serviceDate: todayStr,
        serviceCost: STANDARD_SERVICES[0].cost,
        serviceStatus: "Pending",
        description: STANDARD_SERVICES[0].desc,
      });
      setSelectedVehicleId("");
      setIsCustomService(false);
      setErrors({});
      setEditId(null);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      setNotification({
        type: "error",
        title: "Submission Error",
        message: error.response?.data?.message || "Failed to save service ticket.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setFormData({
      serviceName: service.serviceName,
      vehicleNumber: service.vehicleNumber,
      serviceDate: service.serviceDate ? service.serviceDate.split("T")[0] : todayStr,
      serviceCost: String(service.serviceCost),
      serviceStatus: service.serviceStatus,
      description: service.description,
    });

    const matchedVeh = vehicles.find(
      (v) => v.vehicleNumber.toUpperCase() === service.vehicleNumber.toUpperCase()
    );
    if (matchedVeh) {
      setSelectedVehicleId(matchedVeh._id);
    } else {
      setSelectedVehicleId("custom");
    }

    const isStd = STANDARD_SERVICES.some((s) => s.name === service.serviceName);
    setIsCustomService(!isStd);

    setErrors({});
    setEditId(service._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service ticket?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/services/${id}`);
      setNotification({
        type: "info",
        title: "Service Ticket Deleted",
        message: "The service ticket has been permanently removed.",
      });
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      setNotification({
        type: "error",
        title: "Delete Failed",
        message: error.response?.data?.message || "Could not delete service ticket.",
      });
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setErrors({});
    setSelectedVehicleId("");
    setIsCustomService(false);
    setFormData({
      serviceName: STANDARD_SERVICES[0].name,
      vehicleNumber: "",
      serviceDate: todayStr,
      serviceCost: STANDARD_SERVICES[0].cost,
      serviceStatus: "Pending",
      description: STANDARD_SERVICES[0].desc,
    });
  };

  // Find info of currently selected vehicle
  const activeVehicle =
    vehicles.find((v) => v._id === selectedVehicleId) ||
    vehicles.find(
      (v) =>
        formData.vehicleNumber &&
        v.vehicleNumber.toUpperCase() === formData.vehicleNumber.toUpperCase()
    );

  return (
    <main className="dashboard">
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      <div className="dashboard-header">
        <div>
          <div className="dashboard-pretitle">
            <Wrench size={14} className="pulse-icon" /> Workshop Service Operations
          </div>
          <h1 className="page-heading">Service Management</h1>
          <p className="page-subheading">
            Schedule repairs, auto-fetch enrolled vehicles, select pre-configured jobs, and update repair stages
          </p>
        </div>
        <div className="dashboard-header-right">
          <span className="record-count-badge">
            <Wrench size={14} />
            {services.length} Total {services.length === 1 ? "Ticket" : "Tickets"}
          </span>
        </div>
      </div>

      {/* Service Form Card */}
      <div className="customer-form form-panel">
        <div className="form-panel-header">
          <div className="form-panel-icon amber">
            {editId ? <Pencil size={20} /> : <PlusCircle size={20} />}
          </div>
          <div>
            <h2>{editId ? "Update Service Work Order" : "Initiate Service Order"}</h2>
            <p className="form-panel-subtext">
              {editId
                ? "Modify repair details, pricing estimates, and customer progress"
                : "Select an enrolled vehicle to auto-fetch vehicle specs & owner contact details"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-form-grid">
          {/* Vehicle Dropdown (Auto-Fetched from Vehicles Section) */}
          <div className="input-group-modern full-span">
            <label className="input-label">
              <CarFront size={14} /> Select Enrolled Vehicle (Auto-Fetched) <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                value={selectedVehicleId}
                onChange={handleVehicleSelect}
                className="pro-select-dropdown"
              >
                <option value="">-- Choose an Enrolled Vehicle ({vehicles.length} available) --</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} — {v.model} ({v.customerName})
                  </option>
                ))}
                <option value="custom">+ Type Custom / Unregistered Plate</option>
              </select>
            </div>

            {/* Selected Vehicle Auto-Fetch Banner */}
            {activeVehicle && (
              <div className="selected-vehicle-banner" style={{ marginTop: "12px" }}>
                <div className="banner-vehicle-specs">
                  <span className="banner-plate-tag">{activeVehicle.vehicleNumber}</span>
                  <div>
                    <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px" }}>
                      {activeVehicle.model} • <span style={{ color: "#64748b", fontWeight: "500" }}>{activeVehicle.vehicleType}</span>
                    </div>
                    <div className="banner-customer-tag">
                      Owner: <strong>{activeVehicle.customerName}</strong>
                      {activeVehicle.customerPhone && ` • 📞 ${activeVehicle.customerPhone}`}
                      {activeVehicle.customerEmail && ` • ✉️ ${activeVehicle.customerEmail}`}
                    </div>
                  </div>
                </div>
                <span className="system-pill" style={{ fontSize: "11px" }}>Fleet Record Verified</span>
              </div>
            )}

            {/* Custom Plate input if selected */}
            {(selectedVehicleId === "custom" || (!selectedVehicleId && !vehicles.length)) && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Enter Plate Number (e.g. MH20AB1234)"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  maxLength="12"
                  style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}
                  className={errors.vehicleNumber ? "has-error" : ""}
                />
              </div>
            )}

            {errors.vehicleNumber && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.vehicleNumber}
              </p>
            )}
          </div>

          {/* Service Title / Package (Dropdown with custom option) */}
          <div className="input-group-modern full-span">
            <label className="input-label">
              <Wrench size={14} /> Service Package / Job Title <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                value={isCustomService ? "Custom Service / Major Repair" : formData.serviceName}
                onChange={handleServiceTypeSelect}
                className="pro-select-dropdown"
              >
                {STANDARD_SERVICES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} {s.cost ? `(₹${s.cost})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {isCustomService && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  name="serviceName"
                  placeholder="Enter custom service job title..."
                  value={formData.serviceName}
                  onChange={handleChange}
                  className={errors.serviceName ? "has-error" : ""}
                />
              </div>
            )}

            {errors.serviceName && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.serviceName}
              </p>
            )}
          </div>

          {/* Service Date */}
          <div className="input-group-modern">
            <label className="input-label">
              <Calendar size={14} /> Job Order Date <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="date"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleChange}
                max={todayStr}
                className={errors.serviceDate ? "has-error" : ""}
              />
            </div>
            {errors.serviceDate && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.serviceDate}
              </p>
            )}
          </div>

          {/* Service Cost (with Quick Presets) */}
          <div className="input-group-modern">
            <label className="input-label">
              <IndianRupee size={14} /> Service Charge / Estimate (₹) <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="number"
                name="serviceCost"
                placeholder="Total in INR (₹)"
                value={formData.serviceCost}
                onChange={handleChange}
                min="1"
                step="0.01"
                className={errors.serviceCost ? "has-error" : ""}
              />
            </div>

            {/* Quick Presets */}
            <div className="cost-presets-row">
              <span style={{ fontSize: "11px", color: "#64748b", alignSelf: "center" }}>Quick Presets:</span>
              {COST_PRESETS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  className="cost-preset-chip"
                  onClick={() => applyCostPreset(amt)}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {errors.serviceCost && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.serviceCost}
              </p>
            )}
          </div>

          {/* Service Status (Dropdown) */}
          <div className="input-group-modern full-span">
            <label className="input-label">
              <Clock3 size={14} /> Repair Status Stage <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <select
                name="serviceStatus"
                value={formData.serviceStatus}
                onChange={handleChange}
                className="pro-select-dropdown"
              >
                <option value="Pending">🟡 Pending (Inspection / Waiting for Bay)</option>
                <option value="In Progress">🔵 In Progress (Active Mechanic Servicing)</option>
                <option value="Completed">🟢 Completed (Tested, Cleaned & Ready for Pickup)</option>
              </select>
            </div>
            {errors.serviceStatus && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.serviceStatus}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="input-group-modern full-span">
            <label className="input-label">
              <FileText size={14} /> Service Notes, Diagnostics & Checklist <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <textarea
                name="description"
                placeholder="Diagnostic checklist, replaced components, technician remarks..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={errors.description ? "has-error" : ""}
              ></textarea>
            </div>
            {errors.description && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.description}
              </p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="form-action-row">
            <button type="submit" className="primary-action-btn" disabled={loading}>
              {editId ? <CheckCircle2 size={16} /> : <PlusCircle size={16} />}
              <span>{editId ? "Update Service Order" : "Issue Service Ticket"}</span>
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

      {/* Services Table */}
      <div className="table-wrapper">
        <div className="table-header">
          <h3>Active & Historical Service Tickets ({services.length})</h3>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <Wrench size={48} className="empty-icon" />
            <p className="empty-text">No service tickets recorded yet.</p>
            <p className="empty-subtext">
              Use the form above to log a new vehicle repair job.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Vehicle Plate</th>
                  <th>Service Date</th>
                  <th>Cost (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="service-name-cell">
                        <span className="service-title">{s.serviceName}</span>
                        <span className="service-desc-snippet" title={s.description}>
                          {s.description.length > 55
                            ? `${s.description.substring(0, 55)}...`
                            : s.description}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="plate-badge">{s.vehicleNumber}</span>
                    </td>
                    <td>
                      <span className="date-text">
                        {s.serviceDate ? s.serviceDate.split("T")[0] : "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="cost-badge">
                        ₹{Number(s.serviceCost).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          s.serviceStatus === "Completed"
                            ? "status-completed"
                            : s.serviceStatus === "In Progress"
                            ? "status-in-progress"
                            : "status-pending"
                        }`}
                      >
                        {s.serviceStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="table-action-btn edit-btn"
                          onClick={() => handleEdit(s)}
                          title="Edit Service Ticket"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-action-btn delete-btn"
                          onClick={() => handleDelete(s._id)}
                          title="Delete Service Ticket"
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

export default Services;