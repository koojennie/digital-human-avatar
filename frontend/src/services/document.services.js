import { authServices } from "./auth.services";

class DocumentServices {
  async getDocumentsLibrary({ page = 1, limit = 10 }) {
    const response = await fetch(
      `
			${import.meta.env.VITE_API_URL}/rag/documents?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authServices.getAuthHeader(),
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    return response.json();
  }

  async uploadFileKnowledge(file, metadata = {}) {
    const formData = new FormData();

    formData.append("file", file);

    if (metadata.category) {
      formData.append("category", metadata.category);
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/rag/upload`, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...authServices.getAuthHeader(),
      },
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    return response.json();
  }
}

export { DocumentServices };
