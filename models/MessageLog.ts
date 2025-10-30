import { Schema, model, models } from "mongoose";

const MessageLogSchema = new Schema(
  {
    waMessageId: { type: String, unique: true, index: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MessageLog = models.MessageLog || model("MessageLog", MessageLogSchema);
