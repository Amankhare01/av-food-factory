import mongoose from "mongoose";


const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("❌ Missing MONGODB_URI in environment variables");
}

const MONGODB_URI: string = uri;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return; // already connected
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}
