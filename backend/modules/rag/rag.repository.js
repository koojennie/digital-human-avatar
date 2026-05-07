import { supabase } from "../../utils/supabaseClient.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { geminiEmbeddings } from "../../config/gemini.mjs";

export const uploadPdfToStorage = async (
  fileName,
  fileBuffer,
  contentType = "application/pdf",
) => {
  const { error } = await supabase.storage
    .from("Raw-pdfs")
    .upload(fileName, fileBuffer, {
      contentType,
    });

  if (error) {
    throw new Error(`Gagal upload ke storage: ${error.message}`);
  }
  return true;
};

export const saveVectors = async (documents) => {
  await SupabaseVectorStore.fromDocuments(documents, geminiEmbeddings, {
    client: supabase,
    tableName: "document_chunks",
    queryName: "match_documents",
  });
};

export const vectorStore = new SupabaseVectorStore(geminiEmbeddings, {
  client: supabase,
  tableName: "document_chunks",
  queryName: "match_documents",
});

export async function retrieveDocuments(
  question,
  limit = 10
) {

  return await vectorStore
    .similaritySearchWithScore(
      question,
      limit
    );
}
