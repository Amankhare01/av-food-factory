import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userPhone: { type: String, required: true, unique: true },
    cart: [
      {
        id: String,
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    deliveryType: { type: String, enum: ["delivery", "pickup", null], default: null },
    pendingAction: { type: String, default: null },
    tempOrderMeta: {
      contact: {
        name: String,
        phone: String,
      },
      location: {
        lat: Number,
        long: Number,
        address: String,
      },
    },
  },
  { timestamps: true, collection: "sessions" }
);

export const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
