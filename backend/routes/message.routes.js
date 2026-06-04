// modules/message/message.routes.js

import express from "express";

import messageController from "../modules/message/message.controller.js";

const router = express.Router();

// GET all messages by conversation
router.get(
  "/:userId/:conversationId",
  messageController.getAllMessages
);

// CREATE message + AI response
router.post(
  "/",
  messageController.createMessage
);

// DELETE message
router.delete(
  "/:userId/:id",
  messageController.remove
);

export default router;