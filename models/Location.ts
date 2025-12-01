import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
  driverId: string;
  orderId: string;
  ts: Date;
  lat: number;
  lng: number;
}

const LocationSchema = new Schema(
  {
    driverId: String,
    orderId: String,
    ts: { type: Date, default: Date.now },
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema);
