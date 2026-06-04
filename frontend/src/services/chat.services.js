const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const chatService = {
  async sendMessage({ conversationId, userId, content, type, voice }) {
    const response = await fetch(
      `${API_URL}/message`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: userId,
          conversationId: conversationId,
          type: type,
          content: type === "text" ? content : undefined,
          voice: type === "voice" ? voice : undefined,
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
      `${API_URL}/message/${userId}/${conversationId}`,
    );

    if (!response.ok) {
      throw new Error("Failed fetch history chat");
    }

    return response.json();
  },

  // async initSessions({ userId }) {
  //   const response = await fetch(
  //     `${API_URL}/api/v1/conversation/initialize`,
  //   );
};
