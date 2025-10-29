import mongoose from "mongoose";

export async function connectDB() {
  console.log("🔌 connectDB called"); // ✅ prove entry
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("🔁 already connected");
      return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("❌ no MONGODB_URI");

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
