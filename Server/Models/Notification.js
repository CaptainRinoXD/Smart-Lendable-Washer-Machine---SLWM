import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "session_start",
        "session_end",
        "payment",
        "machine_alert",
        "system",
      ],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    relatedMachine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Machine",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);