import { QueryTypes } from "sequelize";
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
      .eq("document_id", documentId)
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
      .eq("document_id", documentId)
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
      .eq("document_id", documentId);
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

  async countDocuments() {
    try {
      const { count, error } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      throw new Error(`Failed count documents: ${error.message}`);
    }
  }

  async findLastDocument() {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("document_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch last document: ${error.message}`);
    }
  }

  // chunks
  async insertChunks(chunks) {
    const { error } = await supabase.from("document_chunks").insert(chunks);
    if (error) {
      throw new Error(`Failed insert chunks: ${error.message}`);
    }
    return true;
  }
  async similaritySearch(queryEmbedding, limit = 5, filter = {}) {
    const safeFilter = Object.keys(filter).length === 0 ? {} : filter;
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

  async findLastDocumentChunks() {
    try {
      const { data, error } = await supabase
        .from("document_chunks")
        .select("chunk_id")
        .order("chunk_id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch last document: ${error.message}`);
    }
  }
}
export default new RagRepository();
