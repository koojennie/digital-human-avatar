import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import dotenv from "dotenv";

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
  model: "gemini-2.5-flash",
  temperature: 0.2,
  maxOutputTokens: 1024,
});

const geminiChain = prompt.pipe(model).pipe(parser);

class GeminiService {
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

  // async GenerateResponseRestAPi(
  //   question,
  //   context = "Tidak ada konteks tambahan.",
  // ) {
  //   const _baseUrl = `pt1762403887118.my.salesforce.com`;
  //   const modelName = 'sfdc_ai__DefaultVertexAIGemini25Flash001';

  //   const finalPrompt = `
  //     ${template}

  //     QUESTION:
  //     ${question}

  //     CONTEXT:
  //     ${context}

  //     FORMAT:
  //     ${parser.getFormatInstructions()}
  //     `;

  //     const reponse = await fetch(
  //       `${_baseUrl}/models/${modelName}/generations`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type" : "application/json",
  //           Authorization: `Bearer eyJ0bmsiOiJjb3JlL3Byb2QvMDBES2EwMDAwMFRvZ0tUTUFaIiwidmVyIjoiMS4wIiwia2lkIjoiQ09SRV9BVEpXVC4wMERLYTAwMDAwVG9nS1QuMTc3NTUzODI1NjIwMiIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzY3AiOiJzZmFwX2FwaSBhcGkiLCJzdWIiOiJ1aWQ6MDA1S2EwMDAwMDRpcER0SUFJIiwicm9sZXMiOltdLCJpc3MiOiJodHRwczovL3B0MTc2MjQwMzg4NzExOC5teS5zYWxlc2ZvcmNlLmNvbSIsImNsaWVudF9pZCI6IjNNVkc5elN5OW5BYWkxeGw1eU93eUJKcW03VTYybHo2WXRWc19hM3M1QlIxNVJLVGJNRktsNU5iX0wydlhmOGVIdkFzSTl3dGZyRmFKa3Vsa1ZDMmMiLCJjZHBfdGVuYW50IjoiYTM2MC9wcm9kMjEvODc2ZjA4ZGUzY2FjNDVjNGFhOWQ4MGI4Yzk1ZjJhNjUiLCJhdWQiOlsiaHR0cHM6Ly9wdDE3NjI0MDM4ODcxMTgubXkuc2FsZXNmb3JjZS5jb20iLCJodHRwczovL2FwaS5zYWxlc2ZvcmNlLmNvbSJdLCJuYmYiOjE3Nzg0MTIwMTcsIm10eSI6Im9hdXRoIiwic2ZhcF9yaCI6ImJvdC1zdmMtbGxtOmF3cy1wcm9kMjEtdXNlYXN0Mi9laW5zdGVpbjIsbXZzL0VEQzphd3MtcHJvZDIxLXVzZWFzdDIvZWluc3RlaW4yLGJvdC1zdmMtbGxtL0Zsb3dHcHQ6YXdzLXByb2QxLXVzZWFzdDEvZWluc3RlaW4yLGJvdC1zdmMtYXBpOmF3cy1wcm9kMS11c2Vhc3QxL3VlbmdhZ2UxIiwic2ZpIjoiODYwMzNmNTZlZDBkZWFjNTcwMWU1NTRkMmZlYTk4OTFmYWFiMzMxYWFiZWM4OTgxOGNhMzAyNjExYWUxZTBjMSIsInNmYXBfb3AiOiJFaW5zdGVpbkhhd2tpbmdDMkNFbmFibGVkLEVHcHRGb3JEZXZzQXZhaWxhYmxlLEVpbnN0ZWluR2VuZXJhdGl2ZVNlcnZpY2UsVGFibGVhdU1ldHJpY0Jhc2ljcyxTYWxlc2ZvcmNlQ29uZmlndXJhdG9yRW5naW5lLEVpbnN0ZWluR1BUTkNQLE1DUFNlcnZpY2UsQ29yZVByaWNpbmdBY2Nlc3MsT0FJU0MiLCJoc2MiOmZhbHNlLCJjZHBfdXJsIjoiaHR0cHM6Ly9hMzYwLmNkcC5jZHAzLmF3cy1wcm9kMjEtdXNlYXN0Mi5hd3Muc2ZkYy5jbCIsImV4cCI6MTc3ODQ0MDgzMiwiaWF0IjoxNzc4NDEyMDMyfQ.VxkuRhfqMcTGsXe9QzQZQ425zILgsVO54QAOZmNBDqdkD4D6oBSt51x3sxh10nntrJO7c-QIzsuPcTFRRQQ1XtfeLdvQGXyTEFDwy_rly3mSciJgr3C_o4sT02BWJYoxxmYOCXXk2AvZpdbej-tINTqS0i17tvPvrlhxhZi9PLohklrh96bW96qMMXv_I6azR6q-Vd4wApmtC7s_haRi1SjSv6Ja_0YuPvuv3pYv8gJJpXJ-FMeTwCVtjsEn2WdVrFl8peARGmGKCqbtMBYwQlXes5AVj2RtjB-yJ9VZdjgkiuulJSNgDn6C22_ePQvLgFHhGdAZPJQBs8x-VYzZTw`,

  //         }
  //       }
  //     )
  // }
}

export { geminiChain, parser, GeminiService };
