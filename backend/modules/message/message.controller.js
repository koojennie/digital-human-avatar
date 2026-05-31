import messageService from "./message.service.js";

import { CreateMessageDto } from "./message.dto.js";
import { toConversationMessagesResponse } from "./message.mapper.js";

class MessageController {
  async getAllMessages(req, res, next) {
    try {
      const { conversationId, userId } = req.params;

      const result = await messageService.getMessagesByConversation(
        userId,
        conversationId,
        req.query,
      );

      return res.status(200).json({
        success: true,
        message: "Messages fetched successfully",
        data: toConversationMessagesResponse(
          result.conversationId,
          result.messages,
          result.pagination,
        ),
      });
    } catch (error) {
      console.error(error);

      if (error.message === "Unauthorized") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Akses ditolak. Anda tidak berhak melihat chat ini.",
          });
      }
      if (error.message === "Conversation not found") {
        return res
          .status(404)
          .json({ success: false, message: "Riwayat chat tidak ditemukan." });
      }

      // Jika benar-benar ada crash kodingan/database baru lempar 500
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async createMessage(req, res, next) {
    try {
      const { conversationId, userId } = req.params;

      const dto = new CreateMessageDto(req.body);

      const result = await messageService.createMessage(
        userId,
        conversationId,
        dto,
      );

      return res.status(201).json({
        success: true,
        message: "Message created successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error : " + error.message
      });
    }
  }

  async remove(req, res, next) {
    try {
      const { id, userId } = req.params;

      await messageService.deleteMessage(userId, id);

      return res.status(200).json({
        success: true,
        message: "Message deleted",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MessageController();
