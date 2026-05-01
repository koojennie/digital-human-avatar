import fs from "fs";
import { execCommand } from "./files.mjs";
import path from "path";

export const convertAudioToMp3 = async ({ audioData }) => {
  const tempDir = "./tmp";
  const inputPath = path.join(tempDir, "input_audio.webm");
  const outputPath = path.join(tempDir, "output_audio.mp3");
  
  fs.writeFileSync(inputPath, audioData);
  
  // konversi WebM (dari browser) ke MP3 via FFmpeg
  await execCommand({ command: `ffmpeg -y -i "${inputPath}" "${outputPath}"` });
  
  const mp3Data = fs.readFileSync(outputPath);
  
  // bersihkan temp file
  fs.unlinkSync(inputPath);
  
  return mp3Data;
};