import { convertTextToSpeech } from "./elevenLabs.mjs";
import { getPhonemes } from "./rhubarbLipSync.mjs";
import { readJsonTranscript, audioFileToBase64 } from "../utils/files.mjs";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const lipSync = async ({ messages }) => {
  for (let index = 0; index < messages.length; index++) {
    console.log(`Processing message ${index}`);

    const message = messages[index];

    const id = crypto.randomUUID();

    const fileName = `audios/message_${id}.mp3`;

    await delay(1500); // cegah ElevenLabs rate limit

    await convertTextToSpeech({
      text: message.text,
      fileName,
    });

    await getPhonemes({
      fileName,
    });

    message.audio = await audioFileToBase64({
      fileName,
    });

    message.lipsync = await readJsonTranscript({
      fileName: `audios/message_${id}.json`,
    });
  }

  return messages;
};

export { lipSync };
