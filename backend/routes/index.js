import express from "express";
import ragRouter from './rag.routes.js';

const router = express.Router();


router.use('/rag', ragRouter);

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});


export default router;