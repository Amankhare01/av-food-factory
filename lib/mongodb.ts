import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {

      return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("❌ MONGODB_URI not found in environment");
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
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
