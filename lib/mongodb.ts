import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  if (!MONGODB_URI) throw new Error("❌ MONGODB_URI missing");
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
}

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
