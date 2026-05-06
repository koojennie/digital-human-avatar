import express from "express";


const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});


export default router;