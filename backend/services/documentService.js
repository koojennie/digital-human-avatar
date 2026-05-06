import { supabase } from "../utils/supabaseClient.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { geminiEmbeddings } from "../config/gemini.js";
import { writeFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export const processAndIndexPDF = async (file, customMetadata = {}) => {
  const documentId = uuidv4();
  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

  // upload storage
  const { error: storageError } = await supabase.storage
    .from("Raw-pdfs")
    .upload(fileName, file.buffer, {
      contentType: "application/pdf",
    });

  if (storageError) {
    throw new Error(storageError.message);
  }

  // temp file
  const tempPath = `./tmp/${fileName}`;
  writeFileSync(tempPath, file.buffer);

  // load pdf
  const loader = new PDFLoader(tempPath);
  const docs = await loader.load();

  // splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 120,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // metadata
  const finalDocs = splitDocs.map((doc, index) => {
    doc.metadata = {
      ...doc.metadata,
      ...customMetadata, // Menyisipkan metadata dari request body
      source: fileName,
      document_id: documentId,
      chunk_index: index,
    };
    return doc;
  });

  // vector store
  await SupabaseVectorStore.fromDocuments(finalDocs, geminiEmbeddings, {
    client: supabase,
    tableName: 'document_chunks',
    queryName: 'match_documents',
  });

  // const embeddingTest = await geminiEmbeddings.embedQuery("hello world");

  // console.log("EMBEDDING TEST:");
  // console.log(embeddingTest);
  // console.log("VECTOR DIMENSION:");
  // console.log(embeddingTest.length);

  // console.log(finalDocs[0].pageContent);

  return {
    success: true,
    documentId,
    fileName,
  };
};
