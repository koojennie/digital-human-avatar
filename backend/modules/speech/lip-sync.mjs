// import { convertTextToSpeech } from "./elevenLabs.mjs";
// import { getPhonemes } from "./rhubarbLipSync.mjs";
// import { readJsonTranscript, audioFileToBase64 } from "../../utils/files.mjs";

// const lipSync = async ({ messages }) => {
//   const syncPromises = messages.map(async (message, index) => {
//     const fileName = `audios/message_${index}.mp3`;
    
//     await convertTextToSpeech({ text: message.text, fileName });
//     await getPhonemes({ message: index });
    
//     const audio = await audioFileToBase64({ fileName });
//     const lipsync = await readJsonTranscript({ fileName: `audios/message_${index}.json` });

//     return {
//       ...message,
//       audio,
//       lipsync,
//     };
//   });

//   return await Promise.all(syncPromises);
// };

// export { lipSync };