const express = require("express");

const {
  loginAdmin,
} = require("../controllers/adminController");

const router = express.Router();

// Admin Registration Disabled - Only master admin exists
router.post("/register", (req, res) => {
  return res.status(403).json({
    message: "Admin account creation is disabled. Please contact the administrator.",
  });
});

// Admin Login
router.post("/login", loginAdmin);

module.exports = router;