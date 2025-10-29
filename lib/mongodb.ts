import mongoose from "mongoose";

export async function connectDB() {
  console.log("🔌 connectDB called"); // ✅ prove entry
  console.log("process env = ",process.env.MONGODB_URI);
  // try {
  //   if (mongoose.connection.readyState >= 1) {
  //     console.log("🔁 already connected");
  //     return;
  //   }

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("❌ no MONGODB_URI");
    await mongoose.connect(uri);
  //   console.log("✅ MongoDB connected successfully");
  // } catch (err) {
  //   console.error("❌ MongoDB connection error:", err);
  // }
}
 


