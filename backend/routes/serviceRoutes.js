const express = require("express");

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Service Routes

router.post("/", protect, createService);

router.get("/", protect, getServices);

router.get("/:id", protect, getServiceById);

router.put("/:id", protect, updateService);

router.delete("/:id", protect, deleteService);

module.exports = router;