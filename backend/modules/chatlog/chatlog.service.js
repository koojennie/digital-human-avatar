// Import it as an instance (lowercase 'c' prevents treating it as a class constructor)
import chatLogRepository from "./chatlog.repository.js";

class ChatLogService {
  async getSessions() {
    // Fixed typo: respository -> repository
    const data = await chatLogRepository.getAllSessions();

    return {
      total: data.count,
      rows: data.rows,
    };
  }

  async getMessages(conversationId) {
    // Fixed typo: respository -> repository
    const messages = await chatLogRepository.getChatMessagesBySession(conversationId);

    return messages;
  }
}

export default new ChatLogService();
