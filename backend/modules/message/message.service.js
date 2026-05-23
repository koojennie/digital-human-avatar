// modules/message/message.service.js

import conversationRepository from "../conversation/conversation.repository.js";
import messageRepository from "./message.repository.js";
import crypto from "crypto";

import { GeminiService } from "../gemini.mjs";

import { validateCreateMessage } from "./message.validator.js";

import { toCreateMessageEntity } from "./message.mapper.js";
import { TtsService } from "../tts.services.js";
import ragServices from "../rag/rag.services.js";
import {
  deleteFile,
  execCommand,
  readJsonTranscript,
  saveBase64ToWav,
} from "../../utils/files.mjs";
import { rhubarbBin } from "../rhubarbLipSync.mjs";
import { sendDefaultMessages } from "../defaultMessages.mjs";

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

    // default message like halo
    const defaultMessages = await sendDefaultMessages({
      userMessage: payload.content,
    });

    if (defaultMessages) {
      const savedAiMessages = [];

      for (const item of defaultMessages) {
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
          audio: item.audio, // Base64 MP3 bawaan dari file statis
          lipsync: item.lipsync, // JSON Lipsync bawaan dari file statis
        });
      }

      await conversationRepository.touchConversation(conversationId);
      return {
        userMessage,
        aiMessages: savedAiMessages,
      };
    }

    try {
      // dynamic
      const { context } = await ragServices.retrieve(payload.content);

      console.log(
        "[DEBUG 2] Data RAG berhasil diambil. Memanggil Gemini API...",
      );

      // call AI
      const aiResponses = await this.geminiService.generateResponseWithRestAPI(
        payload.content,
        context,
      );
      console.log(
        `[DEBUG 3] Gemini merespons dengan ${aiResponses.length} kalimat.`,
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
        console.log("[DEBUG 4] Menghubungi Hugging Face TTS Space...");
        const ttsResult = await this.ttsService.generateSpeech(item.text);

        if (!ttsResult || !ttsResult.audio_base64) {
          throw new Error("Hugging Face gagal mengembalikan string audio_base64");
        }

        const base64Audio = ttsResult.audio_base64;
        console.log("[DEBUG 5] Audio Base64 dari Hugging Face berhasil diterima.");

        const fileId = crypto.randomBytes(8).toString("hex");
        const wavPath = `audios/message_${fileId}.wav`;
        const jsonPath = `audios/message_${fileId}.json`;

        console.log(`[DEBUG 6] Mencoba menyimpan file lokal sementara ke path: ${wavPath}`);
        await saveBase64ToWav({ base64String: base64Audio, fileName: wavPath });
        console.log("[DEBUG 7] File WAV berhasil disimpan di disk.");

        console.log(`[DEBUG 8] Menjalankan binary Rhubarb di path: ${rhubarbBin}`);
        await execCommand({
          command: `${rhubarbBin} -f json -o ${jsonPath} ${wavPath} -r phonetic`,
        });
        console.log("[DEBUG 9] Eksekusi Rhubarb selesai tanpa hambatan.");

        const lipsyncData = await readJsonTranscript({ fileName: jsonPath });
        console.log("[DEBUG 11] Berkas JSON Lipsync berhasil di-parse.");

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

        // const plainAiMessage = aiMessage.toJSON();

        const plainAiMessage = aiMessage.toJSON();
        savedAiMessages.push({
          ...plainAiMessage,
          audio: base64Audio, // String Audio Base64 dari Hugging Face
          lipsync: lipsyncData, // Array fonetik gerakan bibir dari Rhubarb
        });

        await deleteFile({ fileName: wavPath });
        await deleteFile({ fileName: jsonPath });

        // savedAiMessages.push({
        //   ...plainAiMessage,
        //   audio: ttsResult.audio_base64,
        //   // audio: "ttsResult.audio_base64",
        // });

        // savedAiMessages.push(aiMessage.toJSON());
      }

      await conversationRepository.touchConversation(conversationId);

      return {
        userMessage,
        aiMessages: savedAiMessages,
      };
    } catch (error) {
      console.error(
        "🚨 TERJADI ERROR FATAL PADA ALUR DINAMIS CREATE_MESSAGE 🚨",
      );
      console.error("Pesan Error:", pipelineError.message);
      console.error("Stack Trace:", pipelineError.stack);
      throw error;
    }
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
