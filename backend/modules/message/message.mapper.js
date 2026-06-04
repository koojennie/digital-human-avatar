// modules/message/message.mapper.js

export function toCreateMessageEntity(payload) {
  return {
    message_id: payload.message_id,
    user_id: payload.userId,
    conversation_id: payload.conversationId,
    role: payload.role,
    type: payload.type,
    content: payload.content,
    metadata: payload.metadata || {},
  };
}

export function toMessageResponse(message) {
  return {
    id: message.id,

    role: message.role,

    content: message.content,

    animation:
      message.metadata?.animation || "Idle",

    facialExpression:
      message.metadata?.facialExpression || "default",

    createdAt: message.created_at,
  };
}


export function toConversationMessagesResponse(
  conversationId,
  messages,
  pagination,
) {
  return {
    conversationId,

    messages: messages.map(toMessageResponse),

    pagination,
  };
}
