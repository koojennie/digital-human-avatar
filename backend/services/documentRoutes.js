// import express from "express";
// import { uploadDocument } from "./documentController.js";
// import { upload } from "../utils/uploadMiddleware.js";

// const router = express.Router();

// // Endpoint untuk upload file PDF ke Supabase & Langchain (RAG)
// router.post(
//   "/upload",
//   (req, res, next) => {
//     upload.single("file")(req, res, (err) => {
//       if (err) {
//         return res.status(400).json({ error: err.message });
//       }
//       next();
//     });
//   },
//   uploadDocument,
// );

// router.get("/", (req, res) => {
//   res.status(200).json({ message: "Document Route Active" });
// });

// export default router;
