export class CreateMessageDto {
  constructor(body) {
    this.role = body.role;
    this.content = body.content;
    this.metadata = body.metadata;
  }
}