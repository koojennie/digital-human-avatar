const API_URL = import.meta.env.VITE_API_URL;

export const conversationService = {

  async initSessions({ userId }) {
    const response = await fetch(`${API_URL}/conversation/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        moodleUserId: userId,
      }),
    });

    if(!response.ok){
        throw new Error("Failed to initialize session");
    }
    
    return response.json();
  },
};
