import mongoose, { Schema, models } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    cart: [
      {
        itemId: String,
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    deliveryType: { type: String, default: null },
    step: { type: String, default: "welcome" },
    location: { type: Object, default: {} },
    contact: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Session = models.Session || mongoose.model("Session", SessionSchema);
