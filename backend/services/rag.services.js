import { createRAGChain } from "../config/rag.chain.js";
import { loadPDF, splitDocs } from "../utils/textSplliter.js";
import { createVectorStore } from "../vectorstore/memory.store.js";
import { EmbeddingService } from "./embedding.service.js";

export class RagService {
  async initialize(filePath) {
    const rawDocs = await loadPDF(filePath);
    const split = await splitDocs(rawDocs);
    const vectorStore = await createVectorStore(split);
    this.retriever = vectorStore.asRetriever();
    this.ragChain = createRAGChain(this.retriever);
  }

  async chatWithPDF(question) {
    const response = await this.ragChain.invoke({ question });
    return response.content;
  }
}
