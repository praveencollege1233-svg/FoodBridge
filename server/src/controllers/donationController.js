import Donation from "../models/Donation.js";
import DonationRequest from "../models/DonationRequest.js";

export const listDonations = async (req, res, next) => {
  try {
    const filter = { status: "available", quantity: { $gt: 0 }, pickupBy: { $gt: new Date() } };
    const donations = await Donation.find(filter).populate("donor", "name organizationName address").sort({ pickupBy: 1 });
    res.json({ success: true, donations });
  } catch (error) { next(error); }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (error) { next(error); }
};

export const createDonation = async (req, res, next) => {
  try {
    const { title, description, category, quantity, unit, pickupAddress, pickupBy } = req.body;
    const date = new Date(pickupBy);
    if (!title || !category || !pickupAddress || !pickupBy || !Number.isInteger(Number(quantity)) || Number(quantity) < 1 || date <= new Date()) {
      return res.status(400).json({ success: false, message: "Provide a title, category, positive quantity, pickup address, and future pickup time" });
    }
    const donation = await Donation.create({ donor: req.user._id, title, description, category, quantity, totalQuantity: quantity, unit, pickupAddress, pickupBy: date });
    res.status(201).json({ success: true, donation });
  } catch (error) { next(error); }
};

export const cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, donor: req.user._id, status: "available", quantity: { $gt: 0 } },
      { status: "cancelled" },
      { new: true }
    );
    if (!donation) return res.status(404).json({ success: false, message: "Available donation not found" });
    await DonationRequest.updateMany({ donation: donation._id, status: "pending" }, { status: "rejected" });
    res.json({ success: true, donation });
  } catch (error) { next(error); }
};