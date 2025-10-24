import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: String,
    cart: Array,
    total: Number,
    deliveryType: String,
    location: Object,
    contact: Object,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export const Order = models.Order || mongoose.model("Order", OrderSchema);
