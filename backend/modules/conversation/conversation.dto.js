class ConversationDTO {
  static toResponse(conversation) {
    if (!conversation) return null;
    
    return {
      id: conversation.conversation_id,
      userId: conversation.user_id,
      courseId: conversation.course_id,
      title: conversation.title,
      lastMessageAt: conversation.last_message_at,
      metadata: conversation.metadata,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at
    };
  }

  static toListResponse(conversations) {
    return conversations.map(conv => this.toResponse(conv));
  }
}

export default ConversationDTO;