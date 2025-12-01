

import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  from: string;
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


  driverId?: string;           
  trackingToken?: string;      
  deliveryStatus?: "assigned" | "picked_up" | "on_the_way" | "delivered";
  driverTrackingToken?: string;
  dropoff?: { lat: number; lng: number };
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
    driverId: String,
    trackingToken: String,
    deliveryStatus: {
      type: String,
      enum: ["assigned", "picked_up", "on_the_way", "delivered"],
      default: "assigned",
    },
    driverTrackingToken: String,
    dropoff: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
