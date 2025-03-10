const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
    },
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
