import express from "express";
import { confirmReceipt, createRequest, getManagedRequests, getMyRequests, updateRequest } from "../controllers/requestController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowRoles, requireVerifiedOrganization } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(authenticate);
router.post("/donations/:donationId", allowRoles("ngo"), requireVerifiedOrganization, createRequest);
router.get("/mine", allowRoles("ngo"), getMyRequests);
router.get("/managed", allowRoles("donor"), getManagedRequests);
router.patch("/:id/status", allowRoles("donor"), requireVerifiedOrganization, updateRequest);
router.patch("/deliveries/:id/confirm", allowRoles("ngo"), requireVerifiedOrganization, confirmReceipt);
export default router;