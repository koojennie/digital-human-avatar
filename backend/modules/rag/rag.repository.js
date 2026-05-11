import { supabase } from "../../utils/supabaseClient.js";

class RagRepository {
  async createDocument(payload) {
    const { data, error } = await supabase
      .from("documents")
      .insert(payload)
      .select()
      .single();
    if (error) {
      throw new Error(`Failed create document: ${error.message}`);
    }
    return data;
  }
  async updateDocument(documentId, payload) {
    const { data, error } = await supabase
      .from("documents")
      .update(payload)
      .eq("id", documentId)
      .select()
      .single();
    if (error) {
      throw new Error(`Failed update document: ${error.message}`);
    }
    return data;
  }
  async getDocuments({ page = 1, limit = 10, search = "", status, category }) {
    const offset = (page - 1) * limit;
    let query = supabase
      .from("documents")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });
    if (search) {
      query = query.ilike("title", `%${search}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (category) {
      query = query.eq("category", category);
    }
    const { data, count, error } = await query;
    if (error) {
      throw new Error(`Failed fetch documents: ${error.message}`);
    }
    return {
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
  async findDocumentById(documentId) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (error) {
      return null;
    }
    return data;
  }
  async deleteDocument(documentId) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);
    if (error) {
      throw new Error(`Failed delete document: ${error.message}`);
    }
    return true;
  }
  async uploadPdf(fileName, fileBuffer, contentType) {
    const { error } = await supabase.storage
      .from("Raw-pdfs")
      .upload(fileName, fileBuffer, { contentType, upsert: false });
    if (error) {
      throw new Error(`Failed upload file: ${error.message}`);
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("Raw-pdfs").getPublicUrl(fileName);
    return publicUrl;
  }
  async deletePdf(fileName) {
    const { error } = await supabase.storage
      .from("Raw-pdfs")
      .remove([fileName]);
    if (error) {
      throw new Error(`Failed delete file: ${error.message}`);
    }
    return true;
  }
   // chunks 
  async insertChunks(
    chunks,
  ) {
    const { error } = await supabase.from("document_chunks").insert(chunks);
    if (error) {
      throw new Error(`Failed insert chunks: ${error.message}`);
    }
    return true;
  }
  async similaritySearch(queryEmbedding, limit = 5, filter = {}) {
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: limit,
      filter,
    });
    if (error) {
      throw new Error(`Failed similarity search: ${error.message}`);
    }
    return data;
  }
}
export default new RagRepository();
