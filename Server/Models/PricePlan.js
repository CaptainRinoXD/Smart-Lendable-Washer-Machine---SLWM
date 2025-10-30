import mongoose from "mongoose";

const pricePlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ratePerMinute: {
      type: Number,
      required: true,
    },
    maxDuration: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PricePlan", pricePlanSchema);