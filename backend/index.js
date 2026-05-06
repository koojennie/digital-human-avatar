import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { geminiChain, parser } from "./modules/gemini.mjs";
import { lipSync } from "./modules/lip-sync.mjs";
import { sendDefaultMessages } from "./modules/defaultMessages.mjs";
import { convertAudioToText } from "./modules/whisper.mjs";
import { voice } from "./modules/elevenLabs.mjs";
// import  documentRoutes  from "./services/documentRoutes.js";
import { connectDB, supabase } from "./utils/supabaseClient.js";

import path from "path";
import logRoutes from "./utils/logRoutes.js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// gunakan limit yang besar karena audio base64 bisa berukuran besar
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Pasang router untuk module dokumen (Upload & Indexing PDF RAG)
// app.use("/api/documents", documentRoutes);

app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

app.post("/tts", async (req, res) => {
  try {
    const userMessage = await req.body.message;
    if (await sendDefaultMessages({ userMessage })) return;

    let geminiMessages = await geminiChain.invoke({
      question: userMessage,
      format_instructions: parser.getFormatInstructions(),
    });

    geminiMessages = await lipSync({ messages: geminiMessages.messages });
    res.send({ messages: geminiMessages });
  } catch (error) {
    console.error("Error on /tts:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post("/sts", async (req, res) => {
  try {
    const base64Audio = req.body.audio;
    const audioData = Buffer.from(base64Audio, "base64");

    // 1. audio user diubah ke teks
    const userMessage = await convertAudioToText({ audioData });

    // 2. teks diproses Gemini API
    let geminiMessages = await geminiChain.invoke({
      question: userMessage,
      format_instructions: parser.getFormatInstructions(),
    });

    // 3. respons diubah menjadi audio dan lipsync
    geminiMessages = await lipSync({ messages: geminiMessages.messages });
    res.send({ messages: geminiMessages }); 
  } catch (error) {
    console.error("Error on /sts:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

const startServer = async () => {
  try {
    app.listen(port, () => {
      connectDB();
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server error : ", error);
  }
};

startServer();