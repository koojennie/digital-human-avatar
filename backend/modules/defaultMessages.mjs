import fs from "fs/promises";
import path from "path";

export const sendDefaultMessages = async ({ userMessage }) => {
  // 1. Bersihkan spasi berlebih dan ubah ke lowercase
  const cleanMessage = userMessage.trim().replace(/\s+/g, ' ');
  const lowerMessage = cleanMessage.toLowerCase();

  const greetingKeywords = [
    "halo", "hello", "hi", "hey", "hai", "hallo",
    "selamat pagi", "selamat siang", "selamat sore", "selamat malam",
  ];

  const identityKeywords = ["siapakah kamu", "siapa kamu", "kamu siapa", "siapakah km"];

  // 2. Cek apakah ada keyword sapaan di dalam pesan
  const matchedGreeting = greetingKeywords.find((keyword) =>
    lowerMessage.includes(keyword)
  );

  let isGreeting = false;

  if (matchedGreeting) {
    // 💡 LOGIKA KRUSIAL: Hapus kata sapaan dan tanda baca dari pesan untuk melihat sisa teksnya
    const remainingText = lowerMessage
      .replace(matchedGreeting, "")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // Hapus tanda baca seperti koma atau tanya
      .trim();

    // Hitung jumlah kata yang tersisa setelah sapaan dihapus
    const remainingWordsCount = remainingText ? remainingText.split(" ").length : 0;

    // Jika teks yang tersisa kosong ATAU hanya 1 kata (misal: "Halo gan", "Halo bot"), anggap sapaan murni.
    // Tapi jika tersisa lebih dari 1 kata (misal: "apa itu selector..."), artinya ada pertanyaan materi.
    if (remainingWordsCount <= 1) {
      isGreeting = true;
    }
  }

  const isIdentityRequest = identityKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  // Alur Eksekusi Response Statis
  if (isGreeting) {
    const audioPath = path.join(process.cwd(), "audios", "message_default.mp3");
    const audioBuffer = await fs.readFile(audioPath);
    const base64Audio = audioBuffer.toString("base64");

    const lipsyncPath = path.join(process.cwd(), "audios", "message_default.json");
    const lipsyncRaw = await fs.readFile(lipsyncPath, "utf8");
    const lipsyncData = JSON.parse(lipsyncRaw);

    return [
      {
        text: "Halo Ada yang bisa saya bantu dengan materi kuliah hari ini?",
        facialExpression: "smile",
        animation: "Menjelaskan",
        audio: base64Audio,
        lipsync: lipsyncData,
      },
    ];
  } else if (isIdentityRequest) {
    const audioPath = path.join(process.cwd(), "audios", "message_identity.mp3");
    const audioBuffer = await fs.readFile(audioPath);
    const base64Audio = audioBuffer.toString("base64");

    const lipsyncPath = path.join(process.cwd(), "audios", "message_identity.json");
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