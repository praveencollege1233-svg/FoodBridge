import express from "express";
import { claimDelivery, getMyDeliveries, listAvailableDeliveries, updateDeliveryStatus } from "../controllers/deliveryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(authenticate, allowRoles("volunteer"));
router.get("/available", listAvailableDeliveries);
router.get("/mine", getMyDeliveries);
router.patch("/:id/claim", claimDelivery);
router.patch("/:id/status", updateDeliveryStatus);
export default router;