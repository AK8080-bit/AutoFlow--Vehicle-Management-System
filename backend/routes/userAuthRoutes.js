const express = require("express");
const {
  sendOtp,
  verifyOtp,
  getMyVerifiedData,
} = require("../controllers/userAuthController");
const verifyUserAuth = require("../middleware/userAuthMiddleware");

const router = express.Router();

// Public: send OTP to customer email or for vehicle plate
router.post("/send-otp", sendOtp);

// Public: verify OTP and receive authenticated JWT session token + data
router.post("/verify-otp", verifyOtp);

// Protected: access vehicle and repair data only if email is verified
router.get("/my-data", verifyUserAuth, getMyVerifiedData);

module.exports = router;
