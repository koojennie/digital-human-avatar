// import { geminiLLM } from "../../config/gemini.mjs";
// import { convertAudioToMp3 } from "../../utils/audios.mjs";
// import fs from "fs";


// const genAI = new geminiLLM();

// async function convertAudioToText({ audioData }) {
//   try {
//     const mp3AudioData = await convertAudioToMp3({ audioData });
    
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const audioPart = {
//       inlineData: {
//         data: mp3AudioData.toString("base64"),
//         mimeType: "audio/mp3",
//       },
//     };

//     const prompt = "Transkripsikan audio ini ke dalam teks secara akurat. Hanya berikan teks transkripsinya saja.";
//     const result = await model.generateContent([prompt, audioPart]);
    
//     return result.response.text();
//   } catch (error) {
//     console.error("Error transkripsi Gemini:", error);
//     throw new Error("Gagal mengubah suara menjadi teks.");
//   }
// }

// export { convertAudioToText };