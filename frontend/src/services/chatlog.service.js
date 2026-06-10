import { authServices } from "./auth.services";

const API_URL = import.meta.env.VITE_API_URL;

export const chatLogService = {
  async getMessagesDetailLog( conversationId ) {
    const response = await fetch(
      `${API_URL}/chat-log/messages/${conversationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authServices.getAuthHeader(),
        },
      },
      {
        method: "GET",
      },
    );    

    if (!response.ok) {
      throw new Error("Failed Get message");
    }

    return response.json();
  },

  async fetchAllSessionConversationLog() {
    const response = await fetch(`${API_URL}/chat-log/sessions`, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
        ...authServices.getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error("Failed fetch sessions");
    }

    return response.json();
  },
};
