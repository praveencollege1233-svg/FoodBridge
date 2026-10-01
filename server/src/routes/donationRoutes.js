import express from "express";
import { cancelDonation, createDonation, getMyDonations, listDonations } from "../controllers/donationController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowRoles, requireVerifiedOrganization } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(authenticate);
router.get("/", listDonations);
router.get("/mine", allowRoles("donor"), getMyDonations);
router.post("/", allowRoles("donor"), requireVerifiedOrganization, createDonation);
router.patch("/:id/cancel", allowRoles("donor"), requireVerifiedOrganization, cancelDonation);
export default router;