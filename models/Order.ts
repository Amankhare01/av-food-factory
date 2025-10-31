import { Schema, model, models } from "mongoose";

/**
 * 📦 Order model — stores confirmed user orders
 * Created after the user confirms checkout
 */
const OrderSchema = new Schema(
  {
    user: { type: String, required: true }, // WhatsApp number
    items: [
      {
        id: String,
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ["placed", "preparing", "dispatched", "delivered", "cancelled"],
      default: "placed",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    meta: {
      notes: String,
      estimatedTime: { type: String, default: "30–45 min" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/** Index for quick lookups by user & order date */
OrderSchema.index({ user: 1, createdAt: -1 });

export const Order = models.Order || model("Order", OrderSchema);
