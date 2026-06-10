import express from "express";
import chatlogController from "../modules/chatlog/chatlog.controller.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/sessions", isAdmin ,chatlogController.getSessions);

router.get("/messages/:conversationId", isAdmin, chatlogController.getMessages);

export default router;
