import { execCommand } from "../utils/files.mjs";
import { platform } from "os";

const rhubarbBin =
  platform() === "win32" ? "bin\\rhubarb.exe" : "./bin/rhubarb";

const getPhonemes = async ({ fileName }) => {
  const time = new Date().getTime();

  const baseName = fileName.replace(".mp3", "");

  console.log(`Starting conversion for message ${fileName}`);

  // await execCommand({
  //   command: `ffmpeg -y -i audios/message_${fileName}.mp3 audios/message_${fileName}.wav`
  // });

  await execCommand({
    command: `ffmpeg -y -i ${fileName} ${baseName}.wav`,
  });

  console.log(`Conversion done in ${new Date().getTime() - time}ms`);

  // await execCommand({
  //   command: `${rhubarbBin} -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`,
  // });
   await execCommand({
    command: `${rhubarbBin} -f json -o ${baseName}.json ${baseName}.wav -r phonetic`,
  });

  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

const getPhonemesFromWav = async ({ messageIndex }) => {
  const time = new Date().getTime();
  console.log(
    `[Rhubarb] Starting lip-sync analysis for message_${messageIndex}`,
  );

  // Langsung proses .wav tanpa FFmpeg converter
  await execCommand({
    command: `${rhubarbBin} -f json -o audios/message_${messageIndex}.json audios/message_${messageIndex}.wav -r phonetic`,
  });

  console.log(`[Rhubarb] Lip sync done in ${new Date().getTime() - time}ms`);
};

export { getPhonemes, getPhonemesFromWav, rhubarbBin };
