import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    category: { type: String, enum: ["prepared", "produce", "bakery", "dairy", "pantry", "other"], required: true },
    quantity: { type: Number, min: 0, required: true },
    totalQuantity: { type: Number, min: 1, required: true },
    unit: { type: String, enum: ["meals", "kg", "boxes", "items"], default: "meals" },
    pickupAddress: { type: String, required: true, trim: true, maxlength: 300 },
    pickupBy: { type: Date, required: true },
    status: { type: String, enum: ["available", "reserved", "completed", "cancelled"], default: "available", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);