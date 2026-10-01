import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true, index: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quantity: { type: Number, min: 1, required: true },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected", "delivered"], default: "pending", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("DonationRequest", requestSchema);