import Conversation from "../../models/conversation.model.js";

class ConversationRepository {
  async createConversation(data) {
    return await Conversation.create(data);
  }

  async findActiveSession({ user_id }) {
    return await Conversation.findOne({
      where: { user_id: String(user_id) },
      order: [["created_at", "DESC"]],
    });
  }

  async findConversationById(id) {
    return await Conversation.findByPk(id);
  }

  async findAllConversationByUser(userId) {
    return await Conversation.findAll({
      where: { user_id: userId },
      order: [
        ["last_message_at", "DESC"],
        ["created_at", "DESC"],
      ],
    });
  }

  async updateConversation(id, data) {
    const [affectedRows, [updatedRecord]] = await Conversation.update(data, {
      where: { id },
      returning: true,
    });
    return updatedRecord;
  }

  async deleteConversation(id) {
    return await Conversation.destroy({ where: { id } });
  }

  async touchConversation(conversation_id) {
    return await Conversation.update(
      { last_message_at: new Date() },
      { where: { conversation_id } },
    );
  }
}

export default new ConversationRepository();
