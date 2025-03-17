const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null, // Shop owner will set this field when creating a shop account.
    },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ["customer", "shop", "admin"], required: true },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
