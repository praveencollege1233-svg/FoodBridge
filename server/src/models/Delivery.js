import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "DonationRequest", required: true, unique: true },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true, index: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    status: { type: String, enum: ["available", "assigned", "picked_up", "delivered", "confirmed"], default: "available", index: true },
    deliveredAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Delivery", deliverySchema);