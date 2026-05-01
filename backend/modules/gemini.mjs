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
            "Ekspresi wajah yang digunakan AI. Pilih dari: smile, sad, annoyed, surprised, dan default"
          ),
        animation: z
          .string()
          .describe(
            "Animasi yang digunakan AI. Pilih dari: Idle, Kesal, Sedih, TepukTangan, Menjelaskan dan Bertanya."
          ),
      })
    ),
  })
);

const template = `
  Kamu adalah asisten avatar AI virtual yang bertugas mendampingi pembelajaran jarak jauh.
  Tugas utamamu adalah berinteraksi dengan mahasiswa dan memastikan mereka tetap fokus dan engage.
  Kamu harus SELALU merespons dengan array JSON berisi pesan, maksimal 3 pesan:
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
  model: "gemini-1.5-flash", 
  temperature: 0.2,
  maxOutputTokens: 1024,
});

const geminiChain = prompt.pipe(model).pipe(parser);

export { geminiChain, parser };