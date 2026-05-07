import ConversationDTO from "./conversation.dto.js";
import conversationRepository from "./conversation.repository.js";

class ConversationService {
  async createConversation(userId, data) {
    const conversation = await conversationRepository.createConversation({
      user_id: userId,
      title: data.title || "New Conversation",
      metadata: data.metadata || {},
    });

    return ConversationDTO.toResponse(conversation);
  }

  async getConversationById(id, userId) {
    const conversation = await conversationRepository.findConversationById(id);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.user_id !== userId) {
      throw new Error("Unauthorized access to conversation");
    }

    return ConversationDTO.toResponse(conversation);
  }

  async getUserConversations(userId) {
    const conversations =
      await conversationRepository.findAllConversationByUser(userId);      
    return ConversationDTO.toListResponse(conversations);
  }

  async renameConversation(id, userId, title) {
    const conversation = await conversationRepository.findConversationById(id);

    if (!conversation) throw Error("Conversation not found");
    if (conversation.user_id !== userId)
      throw Error("Unauthorized access to conversation");

    const updated = await conversationRepository.updateConversation(id, {
      title,
    });
    return ConversationDTO.toResponse(updated);
  }

  async deleteConversation(id, userId) {
    const conversation = await conversationRepository.findById(id);

    if (!conversation) throw new Error("Conversation not found");
    if (conversation.user_id !== userId) throw new Error("Unauthorized");

    await conversationRepository.delete(id);
    return true;
  }

  async touchConversation(id) {
    await conversationRepository.touchConversation(id);
  }
}

export default new ConversationService();
