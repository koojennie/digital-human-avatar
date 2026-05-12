import express from "express";
import multer from "multer";
import ragController from "../modules/rag/rag.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), ragController.uploadPdf);
router.get("/documents", ragController.getDocuments);
router.delete("/documents/:documentId", ragController.deleteDocument);
router.post("/retrieve", ragController.retrieve);
router.post("/playground", ragController.retrievePlayGroundAndKnowledge);


export default router;
