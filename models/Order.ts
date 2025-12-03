import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  from: string; // customer's WhatsApp number
  categoryName?: string;
  itemName?: string;
  qty?: number;
  delivery?: "pickup" | "delivery";
  phone?: string;
  address?: string;
  total?: number;
  status?: "created" | "pending" | "paid" | "cancelled";
  paid?: boolean;
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: Date;
  updatedAt: Date;

  // NEW FIELDS FOR DELIVERY & TRACKING
  driverId?: string;
  trackingToken?: string;          // customer tracking token
  driverTrackingToken?: string;    // driver tracking token
  deliveryStatus?: "assigned" | "picked_up" | "on_the_way" | "delivered";

  driverLocation?: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number }; // customer location
}

const OrderSchema = new Schema<IOrder>(
  {
    from: { type: String, required: true },

    categoryName: String,
    itemName: String,
    qty: Number,
    delivery: { type: String, enum: ["pickup", "delivery"] },
    phone: String,
    address: String,
    total: Number,

    status: {
      type: String,
      enum: ["created", "pending", "paid", "cancelled"],
      default: "created",
    },
    paid: { type: Boolean, default: false },
    paymentId: String,
    razorpayOrderId: String,

    // -------------------------
    // DELIVERY & TRACKING
    // -------------------------
    driverId: String,

    trackingToken: String,

    driverTrackingToken: String,

    deliveryStatus: {
      type: String,
      enum: ["assigned", "picked_up", "on_the_way", "delivered"],
      default: "assigned",
    },

    driverLocation: {
      lat: Number,
      lng: Number,
    },

    dropoff: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
