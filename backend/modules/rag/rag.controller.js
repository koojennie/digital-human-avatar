import { geminiChain, parser } from "../gemini.mjs";
import { vectorStore } from "./rag.repository.js";
import { processAndIndexPDF, retrieve } from "./rag.services.js";

export const uploadDocument = async (req, res) => {
  try {
    // 1. Validasi dasar (validasi lebih detail ada di middleware)
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Tidak ada file PDF yang diberikan." });
    }

    // Validasi tipe file agar benar-benar PDF
    if (req.file.mimetype !== "application/pdf") {
      return res
        .status(400)
        .json({ success: false, error: "Format file tidak valid. Harap unggah file PDF." });
    }

    // 2. Ekstrak dan Validasi Metadata dari Body
    const { title, category, description, author, tags } = req.body;

    if (title && title.length > 100) {
      return res
        .status(400)
        .json({ success: false, error: "Judul (title) tidak boleh lebih dari 100 karakter." });
    }

    if (category && typeof category !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Kategori (category) harus berupa teks." });
    }

    // Parsing tags jika dikirim sebagai string (biasa terjadi pada multipart/form-data HTTP payload)
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Format tags tidak valid. Pastikan formatnya array JSON.",
        });
      }
    }

    // Rangkai metadata untuk dikirim ke vector store
    const customMetadata = {
      title: title || req.file.originalname,
      category: category || "general",
      description: description || "",
      author: author || "unknown",
      tags: parsedTags,
      uploadDate: new Date().toISOString(),
    };

    // 3. Panggil service untuk memproses file
    const newDocument = await processAndIndexPDF(req.file, customMetadata);

    // 4. Kirim respons sesuai best practice (201 Created)
    return res
      .status(201)
      .location(`/api/v1/rag/documents/${newDocument.id}`) // Header 'Location'
      .json({
        success: true,
        message: "Dokumen berhasil diproses dan diindeks.",
        data: newDocument,
      });
  } catch (error) {
    console.error('[rag.controller.uploadDocument] Error:', error);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error.message && error.message.toLowerCase().includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = error.message;
    } else {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};

// ask questions
export const retrieveKnowledge = async (req, res) => {
  try {
    const { question } = req.body;

    // Validation
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    // Retrieve context
    const result = await retrieve(question);

    // const result = await vectorStore.similaritySearchWithScore(
    //   "Apa saja techinal skill Jonathan Reed??",
    //   3,
    // );

    console.log(result);

    return res.status(200).json({
      success: true,
      question,
      ...result,
    });
  } catch (error) {
    console.error('[rag.controller.retrieveKnowledge] Error:', error);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error.message && error.message.toLowerCase().includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = error.message;
    } else {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};

// ask questions with knowledge
export const retrieveKnowledgeWithLLM = async (req, res) => {
  try {
    const { question } = req.body;

    // Validation
    if (!question) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    // Retrieve context
    const result = await retrieve(question);

    const context = result.context;

    // 3. prompt
    const prompt = `
      You are a helpful AI assistant.

      Answer ONLY based on the provided context.

      CONTEXT:
      ${context}

      QUESTION:
      ${question}
      `;

    // const result = await vectorStore.similaritySearchWithScore(
    //   "Apa saja techinal skill Jonathan Reed??",
    //   3,
    // );

    const response = await geminiChain.invoke({
      question: prompt,
      format_instructions: parser.getFormatInstructions(),
    });


    console.log(response);

    return res.status(200).json({
      success: true,
      question,
      answer: response.messages,
      // sources: result.documents,
    });
  } catch (error) {
    console.error('[rag.controller.retrieveKnowledgeWithLLM] Error:', error);

    let statusCode = 500;
    let errorMessage = 'Internal Server Error';

    if (error.message && error.message.toLowerCase().includes('not found')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      errorMessage = error.message;
    } else {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
};
