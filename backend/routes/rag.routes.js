import express from "express";
import multer from "multer";
import ragController from "../modules/rag/rag.controller.js";
import { isAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", isAdmin, upload.single("file"), ragController.uploadPdf);
router.get("/documents", isAdmin, ragController.getDocuments);
router.delete("/documents/:documentId", isAdmin, ragController.deleteDocument);
router.post("/retrieve", ragController.retrieve);
router.post("/playground", isAdmin, ragController.retrievePlayGroundAndKnowledge);


export default router;
