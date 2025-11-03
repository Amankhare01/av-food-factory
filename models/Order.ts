import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    from: String,
    categoryName: String,
    itemName: String,
    qty: Number,
    delivery: String,
    phone: String,
    address: String,
    total: Number,
    paid: { type: Boolean, default: false },
    paymentId: String,
  },
  { timestamps: true }
);


export const Order = models.Order || model("Order", OrderSchema);
