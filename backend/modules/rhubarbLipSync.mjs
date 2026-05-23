import { execCommand } from "../utils/files.mjs";
import { platform } from "os";

const rhubarbBin = platform() === "win32" ? "bin\\rhubarb.exe" : "./bin/rhubarb";

const getPhonemes = async ({ message }) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  
  await execCommand({ 
    command: `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav` 
  });
  
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  
  await execCommand({
    command: `${rhubarbBin} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
  });
  
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

const getPhonemesFromWav = async ({ messageIndex }) => {
  const time = new Date().getTime();
  console.log(`[Rhubarb] Starting lip-sync analysis for message_${messageIndex}`);
  
  // Langsung proses .wav tanpa FFmpeg converter
  await execCommand({
    command: `${rhubarbBin} -f json -o audios/message_${messageIndex}.json audios/message_${messageIndex}.wav -r phonetic`,
  });
  
  console.log(`[Rhubarb] Lip sync done in ${new Date().getTime() - time}ms`);
};

export { getPhonemes, getPhonemesFromWav, rhubarbBin };