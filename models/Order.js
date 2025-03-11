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
        options: [
          {
            name: { type: String },
            value: { type: String },
          },
        ],
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price at the time of order
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "creating",
        "pending",
        "preparing",
        "delivering",
        "completed",
        "canceled",
      ],
      default: "creating",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "e_wallet", "cash"],
      required: true,
      default: "cash",
    },
    deliveryAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
