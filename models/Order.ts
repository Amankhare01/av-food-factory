import { Schema, model, models } from "mongoose";


const OrderSchema = new Schema(
{
user: String, // phone
items: [
{ id: String, name: String, price: Number, qty: Number },
],
subtotal: Number,
deliveryAddress: String,
status: { type: String, default: "placed" },
},
{ timestamps: true }
);


export const Order = models.Order || model("Order", OrderSchema);