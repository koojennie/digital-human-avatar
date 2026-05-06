import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import { geminiEmbeddings } from "../config/gemini.js";

export const createVectorStore = async (docs) => {
  return await MemoryVectorStore.fromDocuments(docs, geminiEmbeddings);
};
