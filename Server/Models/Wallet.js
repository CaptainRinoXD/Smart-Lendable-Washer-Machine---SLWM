import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    currency: {
      type: String,
      default: "VND",
      enum: ["VND", "USD"],
    },
    totalDeposited: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastTopupAmount: {
      type: Number,
      default: 0,
    },
    lastTopupDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoTopup: {
      enabled: {
        type: Boolean,
        default: false,
      },
      threshold: {
        type: Number,
        default: 10000,
      },
      topupAmount: {
        type: Number,
        default: 50000,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual methods (không có side effects)
walletSchema.virtual("availableBalance").get(function () {
  return this.balance;
});

walletSchema.methods.hasSufficientBalance = function (amount) {
  return this.balance >= amount;
};

export default mongoose.model("Wallet", walletSchema);