import express from "express";
import { uploadDocument, retrieveKnowledge, retrieveKnowledgeWithLLM} from "../modules/rag/rag.controller.js";
import { upload } from "../utils/uploadMiddleware.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
// Retrieve knowledge
router.post("/retrieve", retrieveKnowledgeWithLLM);

export default router;
