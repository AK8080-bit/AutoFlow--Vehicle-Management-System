const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const seedAdminUser = async () => {
  try {
    const Admin = require("../models/Admin");
    const adminEmail = "ashokkhotkar8080@gmail.com";
    const existing = await Admin.findOne({ email: adminEmail });

    if (!existing) {
      const hashedPassword = await bcrypt.hash("1234567890", 10);
      await Admin.create({
        name: "Ashok Khotkar",
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`[AutoFlow] Master Admin seeded: ${adminEmail}`);
    }
  } catch (err) {
    console.warn("[AutoFlow] Admin seed check:", err.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    await seedAdminUser();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (error.message.includes("whitelist") || error.message.includes("Could not connect")) {
      console.log("\n👉 FIX: Go to MongoDB Atlas (cloud.mongodb.com) -> Network Access -> Add IP Address -> 'Allow Access from Anywhere' (0.0.0.0/0) or 'Add Current IP Address'.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;