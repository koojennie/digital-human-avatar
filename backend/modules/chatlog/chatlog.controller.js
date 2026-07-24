import chatLogService from "./chatlog.service.js";

class ChatLogController {
  async getSessions(req, res) {
    try {
      const result = await chatLogService.getSessions();

      return res.json({
        success: true,

        data: result,
      });
    } catch (error) {
      console.error("[CHAT LOG SESSION ERROR]", error.message);

      return res.status(500).json({
        success: false,

        message: error.message,
      });
    }
  }

  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;

      const result = await chatLogService.getMessages(conversationId);

      return res.json({
        success: true,

        data: result,
      });
    } catch (error) {
      console.error("[CHAT LOG MESSAGE ERROR]", error.message);

      return res.status(500).json({
        success: false,

        message: error.message,
      });
    }
  }
}

export default new ChatLogController();
