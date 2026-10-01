import Donation from "../models/Donation.js";
import DonationRequest from "../models/DonationRequest.js";
import Delivery from "../models/Delivery.js";

export const createRequest = async (req, res, next) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.donationId, status: "available", pickupBy: { $gt: new Date() } });
    if (!donation) return res.status(404).json({ success: false, message: "This donation is no longer available" });
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > donation.quantity) {
      return res.status(400).json({ success: false, message: `Quantity must be between 1 and ${donation.quantity}` });
    }
    const existing = await DonationRequest.findOne({ donation: donation._id, ngo: req.user._id, status: { $in: ["pending", "approved"] } });
    if (existing) return res.status(409).json({ success: false, message: "You already have an active request for this donation" });
    const request = await DonationRequest.create({ donation: donation._id, ngo: req.user._id, quantity, note: req.body.note });
    res.status(201).json({ success: true, request });
  } catch (error) { next(error); }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await DonationRequest.find({ ngo: req.user._id }).populate({ path: "donation", populate: { path: "donor", select: "name organizationName" } }).sort({ createdAt: -1 });
    const deliveries = await Delivery.find({ request: { $in: requests.map((request) => request._id) } }).select("request status");
    const deliveryByRequest = new Map(deliveries.map((delivery) => [String(delivery.request), delivery]));
    res.json({ success: true, requests: requests.map((request) => ({ ...request.toObject(), delivery: deliveryByRequest.get(String(request._id)) || null })) });
  } catch (error) { next(error); }
};

export const getManagedRequests = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donor: req.user._id }).select("_id");
    const requests = await DonationRequest.find({ donation: { $in: donations.map((item) => item._id) } }).populate("ngo", "name organizationName phone").populate("donation", "title quantity unit pickupAddress pickupBy").sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) { next(error); }
};

export const updateRequest = async (req, res, next) => {
  try {
    if (!["approved", "rejected"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    const request = await DonationRequest.findById(req.params.id).populate("donation");
    if (!request || String(request.donation.donor) !== String(req.user._id)) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "pending") return res.status(409).json({ success: false, message: "This request has already been reviewed" });

    const updatedRequest = await DonationRequest.findOneAndUpdate(
      { _id: request._id, status: "pending" },
      { status: req.body.status },
      { new: true }
    );
    if (!updatedRequest) return res.status(409).json({ success: false, message: "This request has already been reviewed" });

    if (req.body.status === "approved") {
      const updatedDonation = await Donation.findOneAndUpdate(
        { _id: request.donation._id, status: "available", quantity: { $gte: request.quantity } },
        { $inc: { quantity: -request.quantity } },
        { new: true }
      );
      if (!updatedDonation) {
        await DonationRequest.findByIdAndUpdate(request._id, { status: "pending" });
        return res.status(409).json({ success: false, message: "There is not enough unclaimed food remaining for this request" });
      }
      if (updatedDonation.quantity === 0) {
        await Donation.findOneAndUpdate({ _id: updatedDonation._id, quantity: 0, status: "available" }, { status: "reserved" });
      }
      await Delivery.create({ request: request._id, donation: request.donation._id });
    }
    res.json({ success: true, request: updatedRequest });
  } catch (error) { next(error); }
};

export const confirmReceipt = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id).populate({ path: "request", select: "ngo" });
    if (!delivery || String(delivery.request.ngo) !== String(req.user._id)) return res.status(404).json({ success: false, message: "Delivery not found" });
    if (delivery.status !== "delivered") return res.status(409).json({ success: false, message: "The volunteer must mark this delivery as delivered first" });
    delivery.status = "confirmed";
    delivery.confirmedAt = new Date();
    await delivery.save();
    await DonationRequest.findByIdAndUpdate(delivery.request._id, { status: "delivered" });
    const [donation, openDeliveries] = await Promise.all([
      Donation.findById(delivery.donation),
      Delivery.exists({ donation: delivery.donation, _id: { $ne: delivery._id }, status: { $ne: "confirmed" } }),
    ]);
    if (donation && donation.quantity === 0 && !openDeliveries) {
      donation.status = "completed";
      await donation.save();
    }
    res.json({ success: true, delivery });
  } catch (error) { next(error); }
};