import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    machineCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "in_use", "offline", "error"],
      default: "available",
    },
    location: {
      type: String,
      required: true,
    },
    currentSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    mqttTopic: {
      type: String,
      required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Machine", machineSchema);