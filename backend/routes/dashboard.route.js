import express from "express";
import dashboardController from "../modules/dashboard/dashboard.controller.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/overview", isAdmin, dashboardController.getDashboardOverview);

export default router;