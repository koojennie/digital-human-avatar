import { authServices } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

export const dashboardServices = {
  async getDashboardOverview() {
    const response = await fetch(`${API_URL}/dashboard/overview`, {
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
};
