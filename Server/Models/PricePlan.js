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
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Đảm bảo chỉ có một price plan là mặc định
pricePlanSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("PricePlan").updateMany(
      { _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export default mongoose.model("PricePlan", pricePlanSchema);