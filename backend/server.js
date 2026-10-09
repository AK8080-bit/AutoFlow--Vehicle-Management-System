const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const connectDB = require("./config/db");

// Customer Routes
const customerRoutes = require("./routes/customerRoutes");

// Vehicle Routes
const vehicleRoutes = require("./routes/vehicleRoutes");

// Service Routes
const serviceRoutes = require("./routes/serviceRoutes");

// Admin Routes
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());

app.use(express.json());

// Customer Routes
app.use("/api/customers", customerRoutes);

// Vehicle Routes
app.use("/api/vehicles", vehicleRoutes);

// Service Routes
app.use("/api/services", serviceRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Vehicle Service Management API is running",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});