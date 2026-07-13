import Message from "../../models/message.model.js";

export const generateMessageId = async () => {
  const lastMessage = await Message.findOne({
    order: [["created_at", "DESC"]],
  });

  const lastNumber = lastMessage
    ? parseInt(lastMessage.message_id.replace("MSG-", ""))
    : 0;

  return `MSG-${String(lastNumber + 1).padStart(4, "0")}`;
};