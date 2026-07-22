import { authServices } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class RagService {
  async retrievePlayground(question, limit = 5, threshold = 0.7) {
    const response = await fetch(`${API_URL}/api/v1/rag/playground`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authServices.getAuthHeader(),
      },
      body: JSON.stringify({
        question: question,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve playground");
    }

    return response.json();
    // return response;
  }
}

export default new RagService();
