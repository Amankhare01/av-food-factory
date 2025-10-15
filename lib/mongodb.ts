
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI environment variable");

let cached: { conn: any; promise: Promise<any> | null } = (global as any).__mongo || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "avfoodfactory" }).then((m) => m);
  }
  cached.conn = await cached.promise;
  (global as any).__mongo = cached;
  return cached.conn;
}

const OrderSchema = new mongoose.Schema({
  whatsappFrom: { type: String, required: true },       // sender phone
  items: [
    {
      name: String,
      price: Number,
      qty: Number,
    },
  ],
  subtotal: Number,
  deliveryType: { type: String, enum: ["delivery", "pickup"], default: "delivery" },
  contact: {
    name: String,
    phone: String,
  },
  location: {
    lat: Number,
    long: Number,
    address: String, 
  },
  status: { type: String, enum: ["Pending","Confirmed","Preparing","Out for delivery","Delivered","Cancelled"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
}, { collection: "orders" });

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
