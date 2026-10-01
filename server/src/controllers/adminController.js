import User from "../models/User.js";
import Donation from "../models/Donation.js";
import DonationRequest from "../models/DonationRequest.js";
import Delivery from "../models/Delivery.js";

export const getAdminOverview = async (req, res, next) => {
  try {
    const [users, donations, requests, deliveries, pendingOrganizations] = await Promise.all([
      User.countDocuments(), Donation.countDocuments(), DonationRequest.countDocuments(), Delivery.countDocuments(),
      User.find({ role: { $in: ["donor", "ngo"] }, verificationStatus: "pending" }).select("name email role organizationName createdAt").sort({ createdAt: -1 }),
    ]);
    res.json({ success: true, stats: { users, donations, requests, deliveries }, pendingOrganizations });
  } catch (error) { next(error); }
};

export const verifyOrganization = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Status must be verified or rejected" });
    const user = await User.findOneAndUpdate({ _id: req.params.userId, role: { $in: ["donor", "ngo"] } }, { verificationStatus: status }, { new: true }).select("name email role organizationName verificationStatus");
    if (!user) return res.status(404).json({ success: false, message: "Organization not found" });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};