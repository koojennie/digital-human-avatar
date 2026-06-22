import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import ragRepository from "./rag.repository.js";
import { geminiEmbeddings } from "../../config/gemini.mjs";
import { GeminiService } from "../gemini.mjs";
import { generateChunkId, generateDocumentId } from "./rag.utils.js";

class RagService {
  async uploadAndIndexPdf(file, metadata = {}) {
    const documentId = await generateDocumentId();

    const sanitizedFileName = file.originalname.replace(/\s+/g, "_");

    const fileName = `${Date.now()}-${sanitizedFileName}`;

    await ragRepository.createDocument({
      document_id: documentId,
      uploaded_by: metadata.uploaded_by,
      title: sanitizedFileName,
      filename: fileName,
      mime_type: file.mimetype,
      file_size: file.size,
      category: metadata.category || "general",
      status: "processing",
      metadata,
    });

    try {
      const publicUrl = await ragRepository.uploadPdf(
        fileName,
        file.buffer,
        file.mimetype,
      );

      const loader = new PDFLoader(new Blob([file.buffer]));

      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 120,
      });

      const splitDocs = await splitter.splitDocuments(docs);

      const chunkContents = splitDocs.map((doc) => doc.pageContent);

      const embeddings = await geminiEmbeddings.embedDocuments(chunkContents);

      const baseChunkId = await generateChunkId();
      
      const baseNumber = parseInt(baseChunkId.replace("CHK-", ""), 10) || 0;

      const chunks = splitDocs.map((doc, index) => {
        const nextNumber = baseNumber + index;
        const currentChunkId = `CHK-${String(nextNumber).padStart(4, "0")}`; 

        return {
          chunk_id: currentChunkId,
          document_id: documentId,
          chunk_index: index,
          content: doc.pageContent,
          metadata: {
            page: doc.metadata?.loc?.pageNumber || 1,
            source: sanitizedFileName,
          },
          embedding: embeddings[index],
        };
      });

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

      await ragRepository.updateDocument(documentId, {
        status: "indexed",
        chunk_count: chunks.length,
        file_url: publicUrl,
      });

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

      await ragRepository.updateDocument(documentId, {
        status: "failed",
      });

      throw error;
    }
  }

  /*
   |--------------------------------------------------------------------------
   | RETRIEVE
   |--------------------------------------------------------------------------
   */

  async retrieve(question, limit = 20) {
    const queryEmbedding = await geminiEmbeddings.embedQuery(question);    

    const results = await ragRepository.similaritySearch(queryEmbedding, limit);
    

    const filtered = results.filter((item) => item.similarity > 0.7);

    const context = filtered
      .map(
        (item, index) => `
          [Source ${index + 1}]
          ${item.content}
`,
      )
      .join("\n\n");

    // return {
    //   context,
    //   documents: filtered,
    // };

    return {
      question,

      summary: {
        totalRetrieved: results.length,
        totalRelevant: filtered.length,
        threshold: 0.7,
      },

      context,

      retrievedChunks: filtered.map((item, index) => ({
        index: index + 1,

        chunkId: item.id,

        documentId: item.document_id,

        similarityScore: Number(item.similarity.toFixed(4)),

        content: item.content,

        metadata: {
          source: item.metadata?.source || null,
          page: item.metadata?.page || null,
        },
      })),
    };
  }

  async retrievePlayGroundAndKnowledge(question, limit = 5, threshold = 0.7) {
    const geminiService = new GeminiService();
    const ragResult = await this.retrieve(question, limit);

    const answersAI = await geminiService.generateResponseWithRestAPI(
      question,
      ragResult.context,
    );

    return {
      question: question,

      answersAI,

      summary: ragResult.summary,

      retrievedChunks: ragResult.retrievedChunks,

      context: ragResult.context,
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
    const document = await ragRepository.findDocumentById(documentId);

    if (!document) {
      throw new Error("Document not found");
    }

    /*
     |--------------------------------------------------------------------------
     | DELETE STORAGE FILE
     |--------------------------------------------------------------------------
     */

    await ragRepository.deletePdf(document.filename);

    /*
     |--------------------------------------------------------------------------
     | DELETE DOCUMENT
     |--------------------------------------------------------------------------
     */

    await ragRepository.deleteDocument(documentId);

    return true;
  }
}

export default new RagService();
