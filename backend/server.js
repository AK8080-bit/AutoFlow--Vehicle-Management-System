const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Customer Routes
const customerRoutes = require("./routes/customerRoutes");

// Vehicle Routes
const vehicleRoutes = require("./routes/vehicleRoutes");

// Service Routes
const serviceRoutes = require("./routes/serviceRoutes");

// Admin Routes
const adminRoutes = require("./routes/adminRoutes");

// User Email Authentication Routes
const userAuthRoutes = require("./routes/userAuthRoutes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user-auth", userAuthRoutes);

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