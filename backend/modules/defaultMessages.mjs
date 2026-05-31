import fs from "fs/promises";
import path from "path";

export const sendDefaultMessages = async ({ userMessage }) => {
  const greetingKeywords = [
    "halo",
    "hello",
    "hi",
    "hey",
    "hai",
    "hallo",
    "selamat pagi",
    "selamat siang",
    "selamat sore",
    "selamat malam"
  ];

  const lowerMessage = userMessage.toLowerCase();
  const isGreeting = greetingKeywords.some((keyword) => lowerMessage.includes(keyword));

  if (isGreeting) {
    const audioPath = path.join(process.cwd(), "audios", "message_default.mp3");
    const audioBuffer = await fs.readFile(audioPath);
    const base64Audio = audioBuffer.toString("base64");

    // read json
    const lipsyncPath = path.join(process.cwd(), "audios", "message_default.json");
    const lipsyncRaw = await fs.readFile(lipsyncPath, "utf8");
    const lipsyncData = JSON.parse(lipsyncRaw);

    return [
      {
        text: "Halo Jennie! Ada yang bisa saya bantu dengan materi kuliah hari ini?",
        facialExpression: "smile",
        animation: "TalkingOne",
        audio: base64Audio,
        lipsync: lipsyncData,
      }
    ];
  }
  return false; 
};