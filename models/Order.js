const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price at the time of order
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "delivering", "completed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "e_wallet", "cash"],
      required: true,
    },
    deliveryAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
