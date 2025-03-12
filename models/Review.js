const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    reviewed: { type: Boolean, required: true, default: false },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
