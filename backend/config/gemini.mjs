import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as dotenv from "dotenv";
dotenv.config();

export const geminiLLM = new ChatGoogleGenerativeAI({
  // model: "gemini-2.5-flash",
  model: "gemini-2.0-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-2",
  apiKey: process.env.GEMINI_API_KEY,
  dimensions: 1536,
  outputDimensionality: 1536,
});