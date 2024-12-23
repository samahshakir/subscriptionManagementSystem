import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  billingFrequency: {
    type: String,
    enum: ["monthly", "annually"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: [
      "cloud services",
      "marketing tools",
      "streaming",
      "music",
      "software",
      "other bills",
    ],
    required: true,
  },
  invoice: {
    type: String,
  },
  isActive: {
    type: String,
    enum: ["paid", "unpaid"],
    required: true,
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
