// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log(" MongoDB Connected");
}

// ----- Order Schema -----
const orderSchema = new mongoose.Schema(
  {
    whatsappFrom: String,
    contact: String,
    address: String,
    pincode: String,
    deliveryType: String,
    items: [
      {
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "orders" }
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
