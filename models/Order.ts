import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    from: { type: String, required: true }, // user's WhatsApp number
    categoryName: String,
    itemName: String,
    qty: Number,
    delivery: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    phone: String,
    address: String,
    total: Number,
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);
