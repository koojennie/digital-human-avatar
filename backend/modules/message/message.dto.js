export class CreateMessageDto {
  constructor(body) {
    this.role = body.role;
    this.type = body.type;
    this.content = body.content;
    this.metadata = body.metadata;
  }
}