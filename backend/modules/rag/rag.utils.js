import ragRepository from "./rag.repository.js";

export const generateDocumentId = async () => {
  const lastDocument = await ragRepository.findLastDocument();

  const lastNumber = lastDocument && lastDocument.document_id
    ? parseInt(lastDocument.document_id.replace("DOC-", ""), 10)
    : 0;

  return `DOC-${String(lastNumber + 1).padStart(4, "0")}`;
};

export const generateChunkId = async () => {
    const lastChunk = await ragRepository.findLastDocumentChunks();

    const lastNumber = lastChunk && lastChunk.document_id
      ? parseInt(lastChunk.document_id.replace("CHK-", ""), 10)
      : 0;
  
    return `CHK-${String(lastNumber + 1).padStart(4, "0")}`;
  
}