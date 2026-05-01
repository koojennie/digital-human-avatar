import { GoogleGenerativeAI } from "@google/generative-ai";
import { convertAudioToMp3 } from "../utils/audios.mjs";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function convertAudioToText({ audioData }) {
  try {
    const mp3AudioData = await convertAudioToMp3({ audioData });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const audioPart = {
      inlineData: {
        data: mp3AudioData.toString("base64"),
        mimeType: "audio/mp3",
      },
    };

    const prompt = "Transkripsikan audio ini ke dalam teks secara akurat. Hanya berikan teks transkripsinya saja.";
    const result = await model.generateContent([prompt, audioPart]);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Error transkripsi Gemini:", error);
    throw new Error("Gagal mengubah suara menjadi teks.");
  }
}

export { convertAudioToText };