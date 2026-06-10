import Conversation from "../../models/conversation.model.js";

export const generateConversationId = async () => {
  const lastConversation = await Conversation.findOne({
    order: [["created_at", "DESC"]],
  });

  const lastNumber = lastConversation
    ? parseInt(lastConversation.conversation_id.replace("CON-", ""))
    : 0;

  return `CON-${String(lastNumber + 1).padStart(4, "0")}`;
};
