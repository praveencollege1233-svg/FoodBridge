import express from "express";
import { getAdminOverview, verifyOrganization } from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(authenticate, allowRoles("admin"));
router.get("/overview", getAdminOverview);
router.patch("/users/:userId/verification", verifyOrganization);
export default router;