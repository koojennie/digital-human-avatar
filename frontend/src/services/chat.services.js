const API_URL = "http://localhost:3000";

export const chatService = {
  async sendMessage({ conversationId, userId, content }) {
    const response = await fetch(
      `${API_URL}/api/v1/message/${userId}/${conversationId}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          content,
          role: "user",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed send message");
    }

    return response.json();
  },

  async fetchHistoryChat({ conversationId, userId }) {
    const response = await fetch(
      `${API_URL}/api/v1/message/${userId}/${conversationId}`,
    );

    if (!response.ok) {
      throw new Error("Failed fetch history chat");
    }

    return response.json();
  },
};
