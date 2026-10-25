const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");

// Fetch vehicles and service records by customer email directly (No OTP required)
const getVehiclesByEmail = async (req, res) => {
  try {
    const emailParam = req.params.email || req.query.email || req.body?.email;
    if (!emailParam) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required.",
      });
    }

    const cleanEmail = emailParam.trim().toLowerCase();

    // Fetch customer details by email
    const customer = await Customer.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    // Fetch vehicles associated with this email or customer name
    let vehicles = [];
    if (customer) {
      vehicles = await Vehicle.find({
        $or: [
          { customerEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") } },
          { customerName: { $regex: new RegExp(`^${customer.name}$`, "i") } },
          { customerId: customer._id },
        ],
      });
    } else {
      vehicles = await Vehicle.find({
        customerEmail: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
      });
    }

    if (!customer && vehicles.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No vehicles found registered under "${cleanEmail}". Please check your email address or track by license plate.`,
      });
    }

    // Attach latest service status and services for each vehicle
    const vehicleListWithServices = await Promise.all(
      vehicles.map(async (v) => {
        const services = await Service.find({
          vehicleNumber: { $regex: new RegExp(`^${v.vehicleNumber}$`, "i") },
        }).sort({ serviceDate: -1, createdAt: -1 });

        return {
          ...v.toObject(),
          services,
          latestService: services.length > 0 ? services[0] : null,
          latestStatus: services.length > 0 ? services[0].serviceStatus : "Pending",
        };
      })
    );

    return res.status(200).json({
      success: true,
      customer: customer || {
        name: vehicles.length > 0 ? vehicles[0].customerName : "Valued Customer",
        email: cleanEmail,
      },
      vehicles: vehicleListWithServices,
    });
  } catch (error) {
    console.error("getVehiclesByEmail error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vehicle records.",
    });
  }
};

module.exports = {
  getVehiclesByEmail,
};
