import { authServices } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

export const engagementServices = {
  async getDashboardOverview() {
    const response = await fetch(`${API_URL}/analytics/engagement`, {
      headers: {
        "Content-Type": "application/json",
        ...authServices.getAuthHeader(),
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    return response.json();
  },

  async getQuizGrades(quizId = 1) {
    const response = await fetch(`${API_URL}/moodle/quiz/${quizId}/grades`, {
      headers: {
        "Content-Type": "application/json",
        ...authServices.getAuthHeader(),
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch quiz grades");
    }

    return response.json();
  },

  // 🚀 METHOD BARU: Tembak Recalculate Batch Sync
  async refreshEngagementBatch() {
    const response = await fetch(`${API_URL}/analytics/refreshtrigger`, {
      headers: {
        "Content-Type": "application/json",
        ...authServices.getAuthHeader(),
      },
      method: "POST", // Method POST ke Express/FastAPI
    });

    if (!response.ok) {
      throw new Error("Failed to recalculate engagement batch");
    }

    return response.json();
  },
};