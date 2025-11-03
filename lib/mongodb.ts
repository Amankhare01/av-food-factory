import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  console.log(" Connecting to MongoDB...");
  try {
    console.log("inside connectDB try block");
    if (isConnected) return;
    const uri = process.env.MONGODB_URI!;
    if (!uri) throw new Error("MONGODB_URI not set in .env");
    await mongoose.connect(uri);
    isConnected = true;
    console.log(" MongoDB connected");
    
  } catch (error) {
    console.error(" MongoDB connection error:", error);
    throw error;
  }


}
