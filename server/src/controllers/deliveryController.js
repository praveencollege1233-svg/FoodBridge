import Delivery from "../models/Delivery.js";

const deliveryFields = { path: "request", populate: [{ path: "ngo", select: "name organizationName phone" }, { path: "donation", populate: { path: "donor", select: "name organizationName phone" } }] };

export const listAvailableDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({ status: "available" }).populate(deliveryFields).sort({ createdAt: 1 });
    res.json({ success: true, deliveries });
  } catch (error) { next(error); }
};

export const getMyDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({ volunteer: req.user._id }).populate(deliveryFields).sort({ updatedAt: -1 });
    res.json({ success: true, deliveries });
  } catch (error) { next(error); }
};

export const claimDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOneAndUpdate({ _id: req.params.id, status: "available" }, { status: "assigned", volunteer: req.user._id }, { new: true }).populate(deliveryFields);
    if (!delivery) return res.status(409).json({ success: false, message: "This delivery has already been assigned" });
    res.json({ success: true, delivery });
  } catch (error) { next(error); }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const nextStatus = req.body.status;
    if (!["picked_up", "delivered"].includes(nextStatus)) return res.status(400).json({ success: false, message: "Status must be picked_up or delivered" });
    const delivery = await Delivery.findOne({ _id: req.params.id, volunteer: req.user._id });
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });
    if ((delivery.status === "assigned" && nextStatus !== "picked_up") || (delivery.status === "picked_up" && nextStatus !== "delivered")) {
      return res.status(409).json({ success: false, message: "Complete delivery steps in order" });
    }
    delivery.status = nextStatus;
    if (nextStatus === "delivered") delivery.deliveredAt = new Date();
    await delivery.save();
    res.json({ success: true, delivery });
  } catch (error) { next(error); }
};