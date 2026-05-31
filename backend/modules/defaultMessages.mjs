import fs from "fs/promises";
import path from "path";

export const sendDefaultMessages = async ({ userMessage }) => {
  const lowerMessage = userMessage.toLowerCase();

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
    "selamat malam",
  ];

  const identityKeywords = ["siapakah kamu", "siapa kamu", "kamu siapa", "siapakah km"];

  const isGreeting = greetingKeywords.some((keyword) =>
    lowerMessage.includes(keyword),
  );
  const isIdentityRequest = identityKeywords.some((keyword) =>
    lowerMessage.includes(keyword),
  );

  if (isGreeting) {
    const audioPath = path.join(process.cwd(), "audios", "message_default.mp3");
    const audioBuffer = await fs.readFile(audioPath);
    const base64Audio = audioBuffer.toString("base64");

    // read json
    const lipsyncPath = path.join(
      process.cwd(),
      "audios",
      "message_default.json",
    );
    const lipsyncRaw = await fs.readFile(lipsyncPath, "utf8");
    const lipsyncData = JSON.parse(lipsyncRaw);

    return [
      {
        text: "Halo Jennie! Ada yang bisa saya bantu dengan materi kuliah hari ini?",
        facialExpression: "smile",
        animation: "Menjelaskan",
        audio: base64Audio,
        lipsync: lipsyncData,
      },
    ];
  } else if (isIdentityRequest) {
    const audioPath = path.join(
      process.cwd(),
      "audios",
      "message_identity.mp3",
    );
    const audioBuffer = await fs.readFile(audioPath);
    const base64Audio = audioBuffer.toString("base64");

    const lipsyncPath = path.join(
      process.cwd(),
      "audios",
      "message_identity.json",
    );
    const lipsyncRaw = await fs.readFile(lipsyncPath, "utf8");
    const lipsyncData = JSON.parse(lipsyncRaw);

    return [
      {
        text: "Tentu saja! Saya adalah asisten avatar AI virtual yang dirancang khusus untuk mendampingi kalian dalam pembelajaran jarak jauh. Tugas utama saya adalah berinteraksi dengan kalian, memastikan kalian tetap fokus, semangat, dan aktif selama proses belajar. Saya di sini untuk membantu kalian mencapai tujuan akademik!",
        facialExpression: "smile",
        animation: "Menjelaskan",
        audio: base64Audio,
        lipsync: lipsyncData,
      },
    ];
  }
  return false;
};
