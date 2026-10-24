const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");

// Create Vehicle
const createVehicle = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.vehicleNumber) {
      data.vehicleNumber = data.vehicleNumber.trim().toUpperCase();
    }

    // Auto-fill customer info if customerId or customerName is provided
    if (data.customerId) {
      const customer = await Customer.findById(data.customerId);
      if (customer) {
        data.customerName = customer.name;
        data.customerEmail = customer.email;
        data.customerPhone = customer.phone;
      }
    } else if (data.customerName && (!data.customerEmail || !data.customerPhone)) {
      const matchedCustomer = await Customer.findOne({
        name: { $regex: new RegExp(`^${data.customerName.trim()}$`, "i") },
      });
      if (matchedCustomer) {
        data.customerId = matchedCustomer._id;
        data.customerEmail = matchedCustomer.email;
        data.customerPhone = matchedCustomer.phone;
      }
    }

    const vehicle = await Vehicle.create(data);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Vehicles
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("customerId").sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Vehicle By ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("customerId");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Vehicle
const updateVehicle = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.vehicleNumber) {
      data.vehicleNumber = data.vehicleNumber.trim().toUpperCase();
    }

    if (data.customerId) {
      const customer = await Customer.findById(data.customerId);
      if (customer) {
        data.customerName = customer.name;
        data.customerEmail = customer.email;
        data.customerPhone = customer.phone;
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    ).populate("customerId");

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Vehicle
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};