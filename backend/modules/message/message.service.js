// modules/message/message.service.js

import conversationRepository from "../conversation/conversation.repository.js";
import messageRepository from "./message.repository.js";

import { GeminiService } from "../gemini.mjs";

import { validateCreateMessage } from "./message.validator.js";

import { toCreateMessageEntity } from "./message.mapper.js";
import { TtsService } from "../tts.services.js";
import ragServices from "../rag/rag.services.js";

class MessageService {
  geminiService = new GeminiService();
  ttsService = new TtsService();

  async createMessage(userId, conversationId, payload) {
    validateCreateMessage(payload);

    const conversation =
      await conversationRepository.findConversationById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.user_id !== userId) {
      throw new Error("Unauthorized");
    }

    // save user message
    const userMessageEntity = toCreateMessageEntity(
      payload,
      userId,
      conversationId,
    );

    const userMessage = await messageRepository.create(userMessageEntity);

    const { context } = await ragServices.retrieve(payload.content);

    // call AI
    const aiResponses = await this.geminiService.generateResponse(
      payload.content,
      context,
    );

    // const aiResponses = [
    //   {
    //     text: "Indonesia adalah sebuah negara kepulauan di Asia Tenggara, yang terletak di antara Samudra Pasifik dan Samudra Hindia.",
    //     facialExpression: "smile",
    //     animation: "Menjelaskan",
    //   },
    //   {
    //     text: "Negara kita ini dikenal dengan keindahan alamnya yang luar biasa, mulai dari pantai-pantai eksotis, gunung berapi, hingga hutan hujan tropis yang kaya akan keanekaragaman hayati.",
    //     facialExpression: "smile",
    //     animation: "Menjelaskan",
    //   },
    //   {
    //     text: "Selain itu, Indonesia juga sangat kaya akan budaya, suku bangsa, bahasa, dan adat istiadat yang berbeda-beda di setiap pulaunya. Menarik sekali, bukan?",
    //     facialExpression: "smile",
    //     animation: "Bertanya",
    //   },
    // ];

    // generate ONE TTS

    // save AI messages
    const savedAiMessages = [];

    for (const item of aiResponses) {
      // const ttsResult = await this.ttsService.generateSpeech(item.text);

      const aiMessage = await messageRepository.create({
        user_id: userId,
        conversation_id: conversationId,
        role: "assistant",
        content: item.text,
        metadata: {
          facialExpression: item.facialExpression,
          animation: item.animation,
        },
      });

      const plainAiMessage = aiMessage.toJSON();

      savedAiMessages.push({
        ...plainAiMessage,
        // audio: ttsResult.audio_base64,
        audio: "ttsResult.audio_base64",
      });

      // savedAiMessages.push(aiMessage.toJSON());
    }

    await conversationRepository.touchConversation(conversationId);

    return {
      userMessage,
      aiMessages: savedAiMessages,
    };
  }

  async getMessagesByConversation(userId, conversationId, query) {
    const conversation =
      await conversationRepository.findConversationById(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.user_id !== userId) {
      throw new Error("Unauthorized");
    }

    const limit = Number(query.limit) || 50;
    const offset = Number(query.offset) || 0;

    const messages = await messageRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );

    return {
      conversationId,
      messages,
      pagination: {
        limit,
        offset,
      },
    };
  }

  async deleteMessage(userId, messageId) {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.user_id !== userId) {
      throw new Error("Unauthorized");
    }

    return messageRepository.delete(messageId);
  }
}

export default new MessageService();
