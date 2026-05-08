import express from "express";
import ragRouter from './rag.routes.js';
import conversationRouter from "./conversation.routes.js";
import messageRouter from "./message.routes.js";


const router = express.Router();


router.use('/rag', ragRouter);
router.use('/conversation', conversationRouter);
router.use('/message', messageRouter);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});


export default router;