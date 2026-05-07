import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const EMBEDDING_MODELS = {
  default: "text-embedding-004",
};

class EmbeddingService {
  static instance;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = new GoogleGenerativeAIEmbeddings({
      model: EMBEDDING_MODELS.default,
    });
  }

  static getInstance() {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  // Fungsi untuk mengubah teks jadi angka pakai model Gemini
  async getEmbedding(text) {
    const model = this.genAI.getGenerativeModel({
      model: EMBEDDING_MODELS.default,
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }
}

export { EmbeddingService };
