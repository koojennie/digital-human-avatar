import chatlogRespository from "./chatlog.respository.js";

class ChatLogService {
  async getSessions() {
    const data = await chatlogRespository.getAllSessions();

    return {
      total: data.count,

      rows: data.rows,
    };
  }

  async getMessages(conversationId) {
    const messages =
      await chatlogRespository.getChatMessagesBySession(conversationId);

    return messages;
  }
}

export default new ChatLogService();
