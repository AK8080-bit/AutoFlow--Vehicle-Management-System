import { useEffect, useState } from "react";
import API from "../services/api";

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

  // Get all customers from MongoDB
  const fetchCustomers = async () => {
    try {
      const response = await API.get("/customers");
      setCustomers(response.data);
    } catch (error) {
      console.error(
        "Error fetching customers:",
        error
      );
    }
  };

  // Load customers when page opens
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Remove error when user starts correcting
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // Validate customer form
  const validateForm = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const email = formData.email.trim();
    const address = formData.address.trim();

    // Name validation
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length < 2) {
      newErrors.name =
        "Name must contain at least 2 characters";
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone =
        "Phone number must contain exactly 10 digits";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address";
    }

    // Address validation
    if (!address) {
      newErrors.address = "Address is required";
    } else if (address.length < 3) {
      newErrors.address =
        "Address must contain at least 3 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Add / Update Customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stop if validation fails
    if (!validateForm()) {
      return;
    }

    try {
      const cleanedData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      };

      if (editId) {
        // Update customer
        await API.put(
          `/customers/${editId}`,
          cleanedData
        );

        alert("Customer updated successfully!");
      } else {
        // Add customer
        await API.post(
          "/customers",
          cleanedData
        );

        alert("Customer added successfully!");
      }

      // Refresh customer list
      fetchCustomers();

      // Clear form
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      setErrors({});
      setEditId(null);
    } catch (error) {
      console.error(
        "Error saving customer:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Something went wrong!"
      );
    }
  };

  // Edit customer
  const handleEdit = (customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });

    setErrors({});
    setEditId(customer._id);
  };

  // Delete customer
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await API.delete(`/customers/${id}`);

      alert("Customer deleted successfully!");

      // Refresh list
      fetchCustomers();
    } catch (error) {
      console.error(
        "Error deleting customer:",
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
      name: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  return (
    <main className="dashboard">
      <h1>Customer Management</h1>

      {/* Customer Form */}

      <div className="customer-form">
        <h2>
          {editId
            ? "✏️ Edit Customer"
            : "➕ Add Customer"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}

          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={formData.name}
            onChange={handleChange}
          />

          {errors.name && (
            <p className="form-error">
              {errors.name}
            </p>
          )}

          {/* Phone */}

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
          />

          {errors.phone && (
            <p className="form-error">
              {errors.phone}
            </p>
          )}

          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          {errors.email && (
            <p className="form-error">
              {errors.email}
            </p>
          )}

          {/* Address */}

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />

          {errors.address && (
            <p className="form-error">
              {errors.address}
            </p>
          )}

          <button type="submit">
            {editId
              ? "Update Customer"
              : "Add Customer"}
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

      {/* Customer List */}

      <div className="customer-list">
        <h2>👥 Customer List</h2>

        {customers.length === 0 ? (
          <p>No customers added yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(
                (customer, index) => (
                  <tr key={customer._id}>
                    <td>{index + 1}</td>

                    <td>{customer.name}</td>

                    <td>{customer.phone}</td>

                    <td>{customer.email}</td>

                    <td>{customer.address}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(customer)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            customer._id
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

export default Customers;