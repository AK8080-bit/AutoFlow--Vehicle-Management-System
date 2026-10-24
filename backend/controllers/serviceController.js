const Service = require("../models/Service");
const Vehicle = require("../models/Vehicle");
const Customer = require("../models/Customer");
const jwt = require("jsonwebtoken");

// Helper to mask email for security
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "registered email";
  const [user, domain] = email.split("@");
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user.substring(0, 2)}***${user.slice(-1)}@${domain}`;
};

// Create Service
const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Services
const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Service By ID
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Service
const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(
      req.params.id
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found",
      });
    }

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Track Vehicle Repair Status (With Email Authentication Verification)
const trackVehicleService = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    const cleanNumber = (vehicleNumber || "").trim().toUpperCase();

    if (!cleanNumber) {
      return res.status(400).json({ message: "Vehicle number is required" });
    }

    const vehicle = await Vehicle.findOne({
      vehicleNumber: { $regex: new RegExp(`^${cleanNumber}$`, "i") },
    });

    const services = await Service.find({
      vehicleNumber: { $regex: new RegExp(`^${cleanNumber}$`, "i") },
    }).sort({ serviceDate: -1, createdAt: -1 });

    if (!vehicle && services.length === 0) {
      return res.status(404).json({
        message: `No service records found for vehicle "${cleanNumber}". Please verify your registration number or contact our desk.`,
      });
    }

    // Determine if requester is authenticated (Admin token or Verified User token)
    let isAuthenticated = false;
    let userEmail = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
          isAuthenticated = true;
          userEmail = decoded.email ? decoded.email.toLowerCase() : null;
        }
      } catch (err) {
        // Token invalid or expired
        isAuthenticated = false;
      }
    }

    // Find registered owner email
    let ownerEmail = vehicle?.customerEmail || "";
    let customerDoc = null;

    if (!ownerEmail && vehicle?.customerName) {
      customerDoc = await Customer.findOne({
        name: { $regex: new RegExp(`^${vehicle.customerName.trim()}$`, "i") },
      });
      if (customerDoc && customerDoc.email) {
        ownerEmail = customerDoc.email;
      }
    }

    const latestService = services.length > 0 ? services[0] : null;

    // IF NOT AUTHENTICATED: Enforce Email Verification Requirement!
    if (!isAuthenticated) {
      return res.status(200).json({
        requiresVerification: true,
        isVerified: false,
        vehicleNumber: cleanNumber,
        vehicleType: vehicle?.vehicleType || "Vehicle",
        model: vehicle?.model || "Registered Model",
        maskedEmail: maskEmail(ownerEmail),
        hasRegisteredEmail: !!ownerEmail,
        targetEmail: ownerEmail || "",
        latestStatus: latestService ? latestService.serviceStatus : "Pending",
        message: "Email verification required. Please verify via email OTP to view your detailed repair records, billing, and history.",
      });
    }

    // IF AUTHENTICATED: Return complete user data
    res.status(200).json({
      requiresVerification: false,
      isVerified: true,
      vehicleNumber: cleanNumber,
      vehicle: vehicle || {
        vehicleNumber: cleanNumber,
        vehicleType: "Vehicle",
        model: "Registered Model",
        customerName: "Vehicle Owner",
      },
      latestStatus: latestService ? latestService.serviceStatus : "Pending",
      latestService,
      services,
      totalServices: services.length,
      isRepairCompleted: latestService ? latestService.serviceStatus === "Completed" : false,
      isRepairInProgress: latestService ? latestService.serviceStatus === "In Progress" : false,
      isRepairPending: latestService ? latestService.serviceStatus === "Pending" : true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  trackVehicleService,
};