import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"

export const splitDocs = async (docs) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return await splitter.splitDocuments(docs);
};

export const loadPDF = async (filepath) => {
  const loader = new PDFLoader(filepath);
  const docs = await loader.load();
  return docs;
};
