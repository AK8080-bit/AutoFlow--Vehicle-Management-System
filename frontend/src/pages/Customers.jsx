import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  X,
  User,
  CheckCircle2,
  AlertCircle,
  CarFront
} from "lucide-react";
import { Link } from "react-router-dom";
import NotificationToast from "../components/NotificationToast";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Get all customers from MongoDB
  const fetchCustomers = async () => {
    try {
      const response = await API.get("/customers");
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const address = formData.address.trim();

    if (!name) {
      newErrors.name = "Customer name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must contain at least 2 characters";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Phone number must contain exactly 10 digits";
    }

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!address) {
      newErrors.address = "Address is required";
    } else if (address.length < 3) {
      newErrors.address = "Address must contain at least 3 characters";
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
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      };

      if (editId) {
        await API.put(`/customers/${editId}`, cleanedData);
        setNotification({
          type: "success",
          title: "Profile Updated",
          message: `Customer profile for ${cleanedData.name} updated successfully.`,
        });
      } else {
        await API.post("/customers", cleanedData);
        setNotification({
          type: "success",
          title: "Customer Registered",
          message: `${cleanedData.name} (${cleanedData.phone}) enrolled successfully.`,
        });
      }

      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
      });
      setErrors({});
      setEditId(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      setNotification({
        type: "error",
        title: "Registration Failed",
        message: error.response?.data?.message || "Something went wrong saving client.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });
    setErrors({});
    setEditId(customer._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/customers/${id}`);
      setNotification({
        type: "info",
        title: "Customer Deleted",
        message: "Customer profile and fleet association removed.",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      setNotification({
        type: "error",
        title: "Delete Failed",
        message: error.response?.data?.message || "Could not delete customer.",
      });
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setErrors({});
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  return (
    <main className="dashboard">
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />

      <div className="dashboard-header">
        <div>
          <div className="dashboard-pretitle">
            <Users size={14} className="pulse-icon" /> Client Relationship
          </div>
          <h1 className="page-heading">Customer Management</h1>
          <p className="page-subheading">
            Register new vehicle owners, manage contact details, and maintain profile records
          </p>
        </div>
        <div className="dashboard-header-right">
          <span className="record-count-badge">
            <Users size={14} />
            {customers.length} Registered {customers.length === 1 ? "Client" : "Clients"}
          </span>
        </div>
      </div>

      {/* Customer Form Card */}
      <div className="customer-form form-panel">
        <div className="form-panel-header">
          <div className="form-panel-icon">
            {editId ? <Pencil size={20} /> : <UserPlus size={20} />}
          </div>
          <div>
            <h2>{editId ? "Update Customer Profile" : "Register New Customer"}</h2>
            <p className="form-panel-subtext">
              {editId ? "Modify customer information and contact records" : "Fill in all mandatory client details below"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-form-grid">
          {/* Name Field */}
          <div className="input-group-modern">
            <label className="input-label">
              <User size={14} /> Full Name <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="text"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "has-error" : ""}
              />
            </div>
            {errors.name && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="input-group-modern">
            <label className="input-label">
              <Phone size={14} /> Phone Number <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="text"
                name="phone"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className={errors.phone ? "has-error" : ""}
              />
            </div>
            {errors.phone && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.phone}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="input-group-modern">
            <label className="input-label">
              <Mail size={14} /> Email Address <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="email"
                name="email"
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "has-error" : ""}
              />
            </div>
            {errors.email && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.email}
              </p>
            )}
          </div>

          {/* Address Field */}
          <div className="input-group-modern">
            <label className="input-label">
              <MapPin size={14} /> Service / Home Address <span className="req">*</span>
            </label>
            <div className="input-box-wrapper">
              <input
                type="text"
                name="address"
                placeholder="Street address, city"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? "has-error" : ""}
              />
            </div>
            {errors.address && (
              <p className="form-error">
                <AlertCircle size={13} /> {errors.address}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-action-row">
            <button type="submit" className="primary-action-btn" disabled={loading}>
              {editId ? <CheckCircle2 size={16} /> : <UserPlus size={16} />}
              <span>{editId ? "Save Changes" : "Register Customer"}</span>
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

      {/* Customer List Card */}
      <div className="customer-list">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-icon-badge">
              <Users size={18} />
            </div>
            <div>
              <h2>Client Directory</h2>
              <p className="section-subtext">Manage accounts, view contacts, and trigger updates</p>
            </div>
          </div>
          <span className="record-count-badge">
            {customers.length} Records
          </span>
        </div>

        {customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={38} />
            </div>
            <h3>No Customers Found</h3>
            <p>Add your first client profile above to start managing vehicle service histories.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Contact Phone</th>
                  <th>Email Address</th>
                  <th>Linked Vehicles</th>
                  <th>Service Address</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={customer._id || index}>
                    <td className="index-cell">{index + 1}</td>
                    <td>
                      <div className="customer-name-cell">
                        <div className="user-avatar-initials">
                          {customer.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="table-cell-highlight">{customer.name}</span>
                      </div>
                    </td>
                    <td>
                      <a href={`tel:${customer.phone}`} className="phone-link">
                        <Phone size={13} className="table-inline-icon" />
                        {customer.phone}
                      </a>
                    </td>
                    <td>
                      <a href={`mailto:${customer.email}`} className="email-link">
                        <Mail size={13} className="table-inline-icon" />
                        {customer.email}
                      </a>
                    </td>
                    <td>
                      <Link
                        to="/vehicles"
                        className="plate-badge"
                        style={{
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          textDecoration: "none",
                        }}
                        title="Click to view fleet vehicles"
                      >
                        <CarFront size={13} />
                        <span>
                          {customer.vehicleCount || 0}{" "}
                          {customer.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <div className="address-cell">
                        <MapPin size={13} className="table-inline-icon" />
                        <span>{customer.address}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          className="action-icon-btn edit"
                          onClick={() => handleEdit(customer)}
                          title="Edit Customer"
                        >
                          <Pencil size={15} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="action-icon-btn delete"
                          onClick={() => handleDelete(customer._id)}
                          title="Delete Customer"
                        >
                          <Trash2 size={15} />
                          <span>Delete</span>
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

export default Customers;