import Message from '../../models/message.model.js';

class MessageRepository {
  async create(data) {
    return await Message.create(data);
  }

  async findByConversationId(conversationId, limit = 50, offset = 0) {
    return await Message.findAll({
      where: { conversation_id: conversationId },
      order: [['created_at', 'ASC']],
      limit,
      offset
    });
  }

  async findById(id) {
    return await Message.findByPk(id);
  }

  async update(id, data) {
    const [affectedRows, [updatedRecord]] = await Message.update(data, {
      where: { id },
      returning: true,
    });
    return updatedRecord;
  }

  async delete(id) {
    return await Message.destroy({ where: { id } });
  }

  async countInConversation(conversationId) {
    return await Message.count({ where: { conversation_id: conversationId } });
  }
}

export default new MessageRepository();