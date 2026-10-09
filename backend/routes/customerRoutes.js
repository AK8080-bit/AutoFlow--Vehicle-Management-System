const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protected Customer Routes

router.post("/", protect, createCustomer);

router.get("/", protect, getCustomers);

router.get("/:id", protect, getCustomerById);

router.put("/:id", protect, updateCustomer);

router.delete("/:id", protect, deleteCustomer);

module.exports = router;