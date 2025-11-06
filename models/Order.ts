// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  from: string; // WhatsApp sender (for sending receipt)
  categoryName?: string;
  itemName?: string;
  qty?: number;
  delivery?: "pickup" | "delivery";
  phone?: string; // delivery phone (user provided)
  address?: string;
  total?: number;
  status?: "created" | "pending" | "paid" | "cancelled";
  paid?: boolean;
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
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
    status: { type: String, enum: ["created", "pending", "paid", "cancelled"], default: "created" },
    paid: { type: Boolean, default: false },
    paymentId: String,
    razorpayOrderId: String,
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
