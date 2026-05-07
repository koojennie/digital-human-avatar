// import { createRAGChain } from "../config/rag.chain.js";
import { loadPDF, splitDocs } from "../../utils/textSplliter.js";
import { createVectorStore } from "../../vectorstore/memory.store.js";
import { EmbeddingService } from "../../services/embedding.service.js";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import {
  uploadPdfToStorage,
  saveVectors,
  retrieveDocuments,
} from "./rag.repository.js";

export const processAndIndexPDF = async (file, customMetadata = {}) => {
  const documentId = uuidv4();
  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  // 1. Upload file ke storage (Tugas Repository)
  await uploadPdfToStorage(fileName, file.buffer, "application/pdf");

  // 2. Load PDF langsung dari buffer memori
  const loader = new PDFLoader(new Blob([file.buffer]));
  const docs = await loader.load();

  // 3. Split dokumen menjadi chunk
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 120,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  // 4. Tambahkan metadata ke setiap chunk
  const finalDocs = splitDocs.map((doc, index) => {
    doc.metadata = {
      ...doc.metadata,
      ...customMetadata,
      source: fileName,
      document_id: documentId,
      chunk_index: index,
    };
    return doc;
  });

  // 5. Simpan vectors ke Database (Tugas Repository)
  await saveVectors(finalDocs);

  // 6. Kembalikan representasi resource yang dibuat
  return {
    id: documentId,
    source: fileName,
    ...customMetadata,
  };
};

export async function retrieve(question) {
  const results = await retrieveDocuments(question);

  const filtered = results.filter(([doc, score]) => score > 0.75);

  const topDocs = filtered.slice(0, 5);

  // const context
  const context = topDocs
    .map(
      ([doc], i) => `
        [Source ${i + 1}]
        ${doc.pageContent}
        `,
    )
    .join("\n\n");

  return {
    context,
    documents: topDocs.map(([doc, score]) => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score,
    })),
  };
}
