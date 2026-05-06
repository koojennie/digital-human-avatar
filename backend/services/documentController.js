import { processAndIndexPDF } from '../services/documentService.js';

export const uploadDocument = async (req, res) => {
  try {
    // 1. Validasi File
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file PDF yang diberikan." });
    }

    // 2. Ekstrak dan Validasi Body (Metadata Opsional)
    const { title, category, description } = req.body;

    if (title && title.length > 100) {
      return res.status(400).json({ error: "Judul (title) tidak boleh lebih dari 100 karakter." });
    }
    
    if (category && typeof category !== 'string') {
      return res.status(400).json({ error: "Kategori (category) harus berupa teks." });
    }

    // Rangkai metadata untuk dikirim ke vector store
    const customMetadata = {
      title: title || req.file.originalname,
      category: category || 'general',
      description: description || '',
    };

    // 3. Proses file dengan menyertakan metadata
    const result = await processAndIndexPDF(req.file, customMetadata);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error saat uploadDocument:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};