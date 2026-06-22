// modules/message/message.service.js

import crypto from "crypto";
import conversationRepository from "../conversation/conversation.repository.js";
import messageRepository from "./message.repository.js";
import ragServices from "../rag/rag.services.js";
import { GeminiService } from "../gemini.mjs";
import { HuggingFaceService } from "../huggingface.services.js";
import { validateCreateMessage } from "./message.validator.js";
import { toCreateMessageEntity } from "./message.mapper.js";
import { sendDefaultMessages } from "../defaultMessages.mjs";
import { rhubarbBin } from "../rhubarbLipSync.mjs";
import {
  deleteFile,
  execCommand,
  readJsonTranscript,
  saveBase64ToWav,
} from "../../utils/files.mjs";
import { generateMessageId } from "./message.utils.js";
import { lipSync } from "../lip-sync.mjs";

class MessageService {
  geminiService = new GeminiService();
  huggingFaceServices = new HuggingFaceService();

  async createMessage(payload) {
    validateCreateMessage(payload);

    const { userId, conversationId } = payload;

    const userText = await this._resolveUserText(payload);

    const messageId = await generateMessageId();
    console.log("messageId", messageId);

    const userMessageEntity = toCreateMessageEntity({
      ...payload,
      message_id: messageId,
      content: userText,
    });

    const userMessage = await messageRepository.create(userMessageEntity);

    const defaultMessages = await sendDefaultMessages({
      userMessage: userText,
    });
    if (defaultMessages) {
      const savedAiMessages = await this._processStaticDefaultMessages(
        userId,
        conversationId,
        defaultMessages,
      );
      return { userMessage, aiMessages: savedAiMessages };
    }

    // 4. Alur Pemrosesan AI Dinamis (RAG -> Gemini -> TTS -> LipSync)
    try {
      const { context } = await ragServices.retrieve(userText);

      const aiResponses = await this.geminiService.generateResponseWithRestAPI(
        userText,
        context,
      );
      console.log(
        `[DEBUG] Gemini merespons dengan ${aiResponses.length} kalimat.`,
      );

      const messagesToProcess = aiResponses.map((item) => ({
        text: item.text,
      }));

      const processedMediaMessages = await lipSync({
        messages: messagesToProcess,
      });

      const savedAiMessages = [];

      for (let i = 0; i < aiResponses.length; i++) {
        const item = aiResponses[i];

        const media = processedMediaMessages[i];

        const messageId = await generateMessageId();

        const aiMessage = await messageRepository.create({
          message_id: messageId,
          user_id: userId,
          conversation_id: conversationId,
          role: "assistant",
          content: item.text,
          metadata: {
            facialExpression: item.facialExpression,
            animation: item.animation,
          },
        });

        savedAiMessages.push({
          ...aiMessage.toJSON(),
          audio: media.audio,
          lipsync: media.lipsync,
        });
      }

      await conversationRepository.touchConversation(conversationId);
      return { userMessage, aiMessages: savedAiMessages };
    } catch (error) {
      console.error("🚨 ERROR FATAL PADA ALUR DINAMIS CREATE_MESSAGE 🚨");
      console.error(`Pesan Error: ${error.message}`);
      throw error;
    }
  }

  async getMessagesByConversation(userId, conversationId, query) {
    const conversation = await this._verifyConversationOwner(
      conversationId,
      userId,
    );

    const limit = Number(query.limit) || 50;
    const offset = Number(query.offset) || 0;

    const rawMessages = await messageRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );

    const plainMessages = rawMessages.map((msg) => msg.toJSON());

    const chronologicalMessages = plainMessages.reverse();

    return {
      conversationId,
      messages: chronologicalMessages,
      pagination: { limit, offset },
    };
  }

  async deleteMessage(userId, messageId) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new Error("Message not found");
    if (message.user_id !== userId) throw new Error("Unauthorized");

    return messageRepository.delete(messageId);
  }

  // ==========================================
  // PRIVATE HELPER METHODS (Clean Code Pillars)
  // ==========================================

  async _verifyConversationOwner(userId, conversationid) {
    if (!conversationid) throw new Error("Conversation ID is required");

    if (!userId) throw new Error("User ID is required");

    return;
  }

  async _resolveUserText(payload) {
    if (!payload.type) throw new Error("Type is required");

    if (payload.type === "voice") {
      const sttResult = await this.huggingFaceServices.convertSoundToText(
        payload.voice,
      );
      return sttResult.text;
    }

    return payload.content;
  }

  async _processStaticDefaultMessages(userId, conversationId, defaultMessages) {
    const savedAiMessages = [];
    const messageId = await generateMessageId();
    for (const item of defaultMessages) {
      const aiMessage = await messageRepository.create({
        message_id: messageId,
        user_id: userId,
        conversation_id: conversationId,
        role: "assistant",
        content: item.text,
        metadata: {
          facialExpression: item.facialExpression,
          animation: item.animation,
        },
      });

      savedAiMessages.push({
        ...aiMessage.toJSON(),
        audio: item.audio,
        lipsync: item.lipsync,
      });
    }
    await conversationRepository.touchConversation(conversationId);
    return savedAiMessages;
  }

  async _generateSpeechAndLipsync(text) {
    const ttsResult = await this.huggingFaceServices.generateSpeech(text);
    if (!ttsResult?.audio_base64) {
      throw new Error("Hugging Face gagal mengembalikan string audio_base64");
    }

    const base64Audio = ttsResult.audio_base64;
    const fileId = crypto.randomBytes(8).toString("hex");
    const wavPath = `audios/message_${fileId}.wav`;
    const jsonPath = `audios/message_${fileId}.json`;

    try {
      await saveBase64ToWav({ base64String: base64Audio, fileName: wavPath });

      await execCommand({
        command: `${rhubarbBin} -f json -o ${jsonPath} ${wavPath} -r phonetic`,
      });

      const lipsyncData = await readJsonTranscript({ fileName: jsonPath });

      return {
        audio: base64Audio,
        lipsync: lipsyncData,
      };
    } finally {
      await deleteFile({ fileName: wavPath }).catch(() => null);
      await deleteFile({ fileName: jsonPath }).catch(() => null);
    }
  }
}

export default new MessageService();
