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
      next(error);
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
      next(error);
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
