import Conversation from "../../models/conversation.model.js";

// Menerima parameter transaction dari level service
export const generateConversationId = async (transaction) => {
  const lastConversation = await Conversation.findOne({
    order: [["created_at", "DESC"]],
    lock: true, // Mengunci baris data di bawah payung transaksi utama
    transaction, 
  });

  const lastNumber = lastConversation
    ? parseInt(lastConversation.conversation_id.replace("CON-", ""), 10)
    : 0;

  return `CON-${String(lastNumber + 1).padStart(4, "0")}`;
};