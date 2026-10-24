const mongoose = require("mongoose");

const userOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Document expires and automatically deleted by MongoDB after 10 minutes
    },
  },
  {
    timestamps: true,
  }
);

const UserOtp = mongoose.model("UserOtp", userOtpSchema);

module.exports = UserOtp;
