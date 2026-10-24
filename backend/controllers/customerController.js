const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");

// Create Customer
const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Customers (with vehicle counts)
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const customersWithVehicles = await Promise.all(
      customers.map(async (c) => {
        const vehicleCount = await Vehicle.countDocuments({
          $or: [
            { customerId: c._id },
            { customerEmail: { $regex: new RegExp(`^${c.email}$`, "i") } },
            { customerName: { $regex: new RegExp(`^${c.name}$`, "i") } },
          ],
        });
        return {
          ...c.toObject(),
          vehicleCount,
        };
      })
    );

    res.status(200).json(customersWithVehicles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Customer By ID
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const vehicles = await Vehicle.find({
      $or: [
        { customerId: customer._id },
        { customerEmail: { $regex: new RegExp(`^${customer.email}$`, "i") } },
        { customerName: { $regex: new RegExp(`^${customer.name}$`, "i") } },
      ],
    });

    res.status(200).json({
      ...customer.toObject(),
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Also sync customer name, email, phone to existing vehicles
    await Vehicle.updateMany(
      { customerId: customer._id },
      {
        $set: {
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
        },
      }
    );

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};