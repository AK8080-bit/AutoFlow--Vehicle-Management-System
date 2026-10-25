const express = require("express");
const { getVehiclesByEmail } = require("../controllers/userAuthController");

const router = express.Router();

// Public: lookup customer vehicles and service history by email (Direct - No OTP)
router.get("/by-email/:email", getVehiclesByEmail);
router.get("/by-email", getVehiclesByEmail);
router.post("/by-email", getVehiclesByEmail);

// Backward compatibility alias
router.get("/my-data", getVehiclesByEmail);

module.exports = router;
