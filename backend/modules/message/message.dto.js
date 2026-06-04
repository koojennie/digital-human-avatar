export class CreateMessageDto {
  constructor(body) {
    this.userId = body.userId;
    this.conversationId = body.conversationId;
    this.role = body.role;
    this.type = body.type;
    this.content = body.content;
    this.voice = body.voice;
    this.metadata = body.metadata;
  }
}