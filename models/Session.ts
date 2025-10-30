import { Schema, model, models } from "mongoose";

const SessionSchema = new Schema(
  {
    user: { type: String, index: true, unique: true }, // phone number
    state: { type: String, default: "IDLE" },
    cart: [{ id: String, name: String, price: Number, qty: Number }],
    tempItemId: { type: String, default: null },
    deliveryAddress: { type: String, default: null },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Session = models.Session || model("Session", SessionSchema);
