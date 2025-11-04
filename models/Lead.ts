import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  guests: String,
  source: String,
  status: { type: String, default: "new" },
  createdAt: { type: Date, default: Date.now },
  ip: String,
  ua: String,
  notes: String,
});

export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
