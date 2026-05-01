import fs from "fs";
import { execCommand } from "./files.mjs";

export const convertAudioToMp3 = async ({ audioData }) => {
  const inputPath = "/tmp/input_audio.webm";
  const outputPath = "/tmp/output_audio.mp3";
  
  fs.writeFileSync(inputPath, audioData);
  
  // konversi WebM (dari browser) ke MP3 via FFmpeg
  await execCommand({ command: `ffmpeg -y -i ${inputPath} ${outputPath}` });
  
  const mp3Data = fs.readFileSync(outputPath);
  
  // bersihkan temp file
  fs.unlinkSync(inputPath);
  
  return mp3Data;
};