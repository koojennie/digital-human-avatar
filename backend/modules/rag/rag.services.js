
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { v4 as uuidv4 } from "uuid";

import ragRepository from "./rag.repository.js";
import { geminiEmbeddings } from "../../config/gemini.mjs";

class RagService {
  

  async uploadAndIndexPdf(file, metadata = {}) {
    const documentId = uuidv4();

    const sanitizedFileName = file.originalname.replace(/\s+/g, "_");

    const fileName = `${Date.now()}-${sanitizedFileName}`;

    

    await ragRepository.createDocument({
      id: documentId,
      title: sanitizedFileName,
      filename: fileName,
      mime_type: file.mimetype,
      file_size: file.size,
      category: metadata.category || "general",
      status: "processing",
      metadata,
    });

    try {
      /*
       |--------------------------------------------------------------------------
       | UPLOAD PDF TO STORAGE
       |--------------------------------------------------------------------------
       */

      const publicUrl = await ragRepository.uploadPdf(
        fileName,
        file.buffer,
        file.mimetype
      );

      /*
       |--------------------------------------------------------------------------
       | LOAD PDF
       |--------------------------------------------------------------------------
       */

      const loader = new PDFLoader(
        new Blob([file.buffer])
      );

      const docs = await loader.load();

      /*
       |--------------------------------------------------------------------------
       | SPLIT DOCUMENTS
       |--------------------------------------------------------------------------
       */

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 120,
      });

      const splitDocs =
        await splitter.splitDocuments(docs);

      /*
       |--------------------------------------------------------------------------
       | EXTRACT CONTENTS
       |--------------------------------------------------------------------------
       */

      const chunkContents = splitDocs.map(
        (doc) => doc.pageContent
      );

      /*
       |--------------------------------------------------------------------------
       | GENERATE EMBEDDINGS
       |--------------------------------------------------------------------------
       */

      const embeddings =
        await geminiEmbeddings.embedDocuments(
          chunkContents
        );

      /*
       |--------------------------------------------------------------------------
       | BUILD CHUNKS
       |--------------------------------------------------------------------------
       */

      const chunks = splitDocs.map((doc, index) => ({
        document_id: documentId,

        chunk_index: index,

        content: doc.pageContent,

        metadata: {
          page:
            doc.metadata?.loc?.pageNumber || 1,

          source: sanitizedFileName,
        },

        embedding: embeddings[index],
      }));

      /*
       |--------------------------------------------------------------------------
       | INSERT CHUNKS
       |--------------------------------------------------------------------------
       */

      await ragRepository.insertChunks(chunks);

      /*
       |--------------------------------------------------------------------------
       | UPDATE DOCUMENT
       |--------------------------------------------------------------------------
       */

      await ragRepository.updateDocument(
        documentId,
        {
          status: "indexed",
          chunk_count: chunks.length,
          file_url: publicUrl,
        }
      );

      /*
       |--------------------------------------------------------------------------
       | RESPONSE
       |--------------------------------------------------------------------------
       */

      return {
        id: documentId,
        title: sanitizedFileName,
        status: "indexed",
        chunkCount: chunks.length,
        fileUrl: publicUrl,
      };
    } catch (error) {
      /*
       |--------------------------------------------------------------------------
       | UPDATE FAILED STATUS
       |--------------------------------------------------------------------------
       */

      await ragRepository.updateDocument(
        documentId,
        {
          status: "failed",
        }
      );

      throw error;
    }
  }

  /*
   |--------------------------------------------------------------------------
   | RETRIEVE
   |--------------------------------------------------------------------------
   */

  async retrieve(question, limit = 5) {
    /*
     |--------------------------------------------------------------------------
     | EMBED QUERY
     |--------------------------------------------------------------------------
     */

    const queryEmbedding =
      await geminiEmbeddings.embedQuery(question);

    /*
     |--------------------------------------------------------------------------
     | VECTOR SEARCH
     |--------------------------------------------------------------------------
     */

    const results =
      await ragRepository.similaritySearch(
        queryEmbedding,
        limit
      );

    /*
     |--------------------------------------------------------------------------
     | FILTER SIMILARITY
     |--------------------------------------------------------------------------
     */

    const filtered = results.filter(
      (item) => item.similarity > 0.7
    );

    /*
     |--------------------------------------------------------------------------
     | BUILD CONTEXT
     |--------------------------------------------------------------------------
     */

    const context = filtered
      .map(
        (item, index) => `
[Source ${index + 1}]
${item.content}
`
      )
      .join("\n\n");

    /*
     |--------------------------------------------------------------------------
     | RESPONSE
     |--------------------------------------------------------------------------
     */

    return {
      context,
      documents: filtered,
    };
  }

  /*
   |--------------------------------------------------------------------------
   | GET DOCUMENTS
   |--------------------------------------------------------------------------
   */

  async getDocuments(query) {
    return await ragRepository.getDocuments({
      page: Number(query.page) || 1,

      limit: Number(query.limit) || 10,

      search: query.search || "",

      status: query.status,

      category: query.category,
    });
  }

  /*
   |--------------------------------------------------------------------------
   | DELETE DOCUMENT
   |--------------------------------------------------------------------------
   */

  async deleteDocument(documentId) {
    const document =
      await ragRepository.findDocumentById(
        documentId
      );

    if (!document) {
      throw new Error("Document not found");
    }

    /*
     |--------------------------------------------------------------------------
     | DELETE STORAGE FILE
     |--------------------------------------------------------------------------
     */

    await ragRepository.deletePdf(
      document.filename
    );

    /*
     |--------------------------------------------------------------------------
     | DELETE DOCUMENT
     |--------------------------------------------------------------------------
     */

    await ragRepository.deleteDocument(
      documentId
    );

    return true;
  }
}

export default new RagService();

