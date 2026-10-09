const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    registrationYear: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = Vehicle;