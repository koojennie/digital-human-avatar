import conversationService from "./conversation.services.js";

class ConversationController {
  async create(req, res, next) {
    try {
      // Assuming userId comes from auth middleware
      const userId = req.user.id;
      const result = await conversationService.createConversation(
        userId,
        req.body,
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const {userId} = req.body;
      console.log(req.body);
      
      const result = await conversationService.getUserConversations(userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const result = await conversationService.getConversationById(id, userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.user.id;
      const result = await conversationService.renameConversation(
        id,
        userId,
        title,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await conversationService.deleteConversation(id, userId);

      return res.status(200).json({
        success: true,
        message: "Conversation deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConversationController();
