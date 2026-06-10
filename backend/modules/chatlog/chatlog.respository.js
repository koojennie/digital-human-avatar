import Conversation from "../../models/conversation.model.js";
import Course from "../../models/course.model.js";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";

class ChatLogRepository {
  async getAllSessions(limit = 50, offset = 0) {
    return await Conversation.findAndCountAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "username", "full_name"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["course_id", "fullname", "shortname"],
        },
      ],
      order: [["last_message_at", "DESC"]],
      limit,
      offset,
    });
  }

  // 2. Ambil isi chat lengkap di dalam satu sesi untuk sisi kanan
  async getChatMessagesBySession(conversationId) {
    return await Message.findAll({
      where: {
        conversation_id: conversationId,
      },

      attributes: ["message_id", "role", "type", "content", "created_at"],

      order: [["created_at", "ASC"]],

      raw: true,
    });
  }
}

export default new ChatLogRepository();
