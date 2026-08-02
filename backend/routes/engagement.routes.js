import express from "express";
import engagementController from "../modules/engagement/engagement.controller.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/engagement", isAdmin, engagementController.getEngagementAnalytics);
router.post("/refreshtrigger", isAdmin, engagementController.refreshEngagementData);

export default router;