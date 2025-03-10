const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discount: { type: Number, required: true }, // Percentage discount
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    usageLimit: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
