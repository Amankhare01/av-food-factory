import { Schema, model, models } from "mongoose";

/**
 * 🧠 Session model — stores user conversation state
 * Each WhatsApp user (by phone number) has one active session
 */
const SessionSchema = new Schema(
  {
    user: { type: String, required: true, unique: true, index: true }, // WhatsApp number
    state: {
      type: String,
      enum: [
        "IDLE",
        "BROWSING_MENU",
        "ADDING_ITEM_QTY",
        "ASK_ADDRESS",
        "CONFIRMING_ORDER",
        "DONE",
      ],
      default: "IDLE",
    },
    cart: [
      {
        id: { type: String },
        name: { type: String },
        price: { type: Number },
        qty: { type: Number },
      },
    ],
    tempItemId: { type: String, default: null },
    deliveryAddress: { type: String, default: null },
    lastMessageAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/** TTL index for cleanup (auto-remove inactive sessions after 7 days) */
SessionSchema.index({ lastMessageAt: 1 }, { expireAfterSeconds: 604800 });

export const Session = models.Session || model("Session", SessionSchema);
