import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  whatsappFrom: String,
  contact: String,
  address: String,
  pincode: String,
  deliveryType: String,
  items: [{ name: String, price: Number, qty: Number }],
  subtotal: Number,
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);