import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import dotenv, { parse } from "dotenv";

dotenv.config();

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    messages: z.array(
      z.object({
        text: z.string().describe("Teks yang akan diucapkan oleh AI"),
        facialExpression: z
          .string()
          .describe(
            "Ekspresi wajah yang digunakan AI. Pilih dari: smile, sad, annoyed, surprised, dan default",
          ),
        animation: z
          .string()
          .describe(
            "Animasi yang digunakan AI. Pilih dari: Idle, Kesal, Sedih, TepukTangan, Menjelaskan, dan Bertanya.",
          ),
      }),
    ),
  }),
);

const template = `
  Kamu adalah asisten avatar AI virtual yang bertugas mendampingi pembelajaran jarak jauh.
  Tugas utamamu adalah berinteraksi dengan mahasiswa dan memastikan mereka tetap fokus dan engage.

  BERIKUT ADALAH KONTEKS MATERI (KNOWLEDGE BASE):
  {context}

  INSTRUKSI:
  1. Jika KONTEKS di atas relevan dengan pertanyaan, gunakan KONTEKS tersebut untuk menjawab.
  2. Jika KONTEKS kosong atau tidak relevan, jawablah secara ramah menggunakan pengetahuan umum kamu.
  3. Gunakan gaya bahasa yang menyemangati mahasiswa.
  
  Kamu harus SELALU merespons dengan array JSON berisi pesan dengan pesan singkat dan jelas, berikan 1 sampai maksimal 3 pesan:
  \n{format_instructions}.
  
  Konteks penggunaan animasi:
  - Gunakan 'Menjelaskan' saat menjelaskan materi.
  - Gunakan 'Bertanya' saat bertanya atau memancing interaksi.
  - Gunakan 'TepukTangan' untuk mengapresiasi jawaban benar.
  - Gunakan 'Kesal' jika mahasiswa memberikan respons yang kurang sesuai.
  - Gunakan 'Sedih' jika ada sesuatu yang mengecewakan atau kurang tepat.
  - Gunakan 'Idle' saat santai atau default.
`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", template],
  ["human", "{question}"],
]);

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "-",
  model: "gemini-2.5-flash-lite",
  temperature: 0.2,
  maxOutputTokens: 1024,
});

const geminiChain = prompt.pipe(model).pipe(parser);

const cleanJson = (text) => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

class GeminiService {
  accessToken = null;

  //  constructor(){
  //   this.accessToken = null;
  //  }

  async generateResponse(question, context = "Tidak ada konteks tambahan.") {
    const result = await geminiChain.invoke({
      question,
      context,
      format_instructions: parser.getFormatInstructions(),
    });

    return result.messages;
  }

  async authenticateRestAPI() {
    try {
      const response = await fetch(
        `${process.env.AUTH_SF_BASE_URL}/services/oauth2/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.SF_CLIENT_ID || "",
            client_secret: process.env.SF_CLIENT_SECRET || "",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      return this.accessToken;
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  }

  async generateResponseWithRestAPI(
    question,
    context = "Tidak ada konteks tambahan.",
  ) {
    try {
      if (!this.accessToken) {
        await this.authenticateRestAPI();
      }

      const modelName =
        process.env.MODEL_NAME || "sfdc_ai__DefaultVertexAIGemini25Flash001";

      // const _baseUrl = `pt1762403887118.my.salesforce.com`;
      // const modelName = 'sfdc_ai__DefaultVertexAIGemini25Flash001';

      const finalPrompt = `
      ${template}

      QUESTION:
      ${question}

      CONTEXT:
      ${context}

      FORMAT:
      ${parser.getFormatInstructions()}
      `;

      const response = await fetch(
        `${process.env.SF_BASE_URL_API}/models/${modelName}/generations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
            "x-sfdc-app-context": "EinsteinGPT",
            "x-client-feature-id": "ai-platform-models-connected-app",
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            // temperature: 0.2,
            // max_tokens: 1024,
          }),
        },
      );

      if (response.status === 401) {
        console.log("TOKEN REFRESH...");
        await this.authenticateRestAPI();
        return await this.generateResponseWithRestAPI(question, context);
      }

      if (!response.ok) {
        const errText = await response.text();

        throw new Error(errText);
      }

      const data = await response.json();

      const rawText =
        data?.generation?.generatedText || data?.generation?.text || "";

      const cleaned = cleanJson(rawText);

      const parsed = JSON.parse(cleaned);

      // const message = parsed.message.map((item) => {
      //   const text = item.pesan || item.text || "";
      //   const animation = item.animation;
      //   const facialExpression = item.facialExpression;

      //   return {
      //     text,
      //     animation,
      //     facialExpression,
      //   };
      // });

      // console.log('here for the message, ', message);

      // return message;
      
      return parsed.messages;
    } catch (err) {
      console.log('error generateResponseWithRestAPI Gemini Service', err);
      throw err;
    }
  }
}

export { geminiChain, parser, GeminiService };
