const express = require("express");

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  trackVehicleService,
} = require("../controllers/serviceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public Vehicle Tracking Route (Users can check their repair status)
router.get("/track/:vehicleNumber", trackVehicleService);

// Protected Admin Routes (Only Admin can upload / modify data)
router.post("/", protect, createService);
router.get("/", protect, getServices);
router.get("/:id", protect, getServiceById);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;