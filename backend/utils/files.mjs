import { exec } from "child_process";
import { promises as fs } from "fs";

export const execCommand = ({ command }) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

export const readJsonTranscript = async ({ fileName }) => {
  const data = await fs.readFile(fileName, "utf8");
  return JSON.parse(data);
};

export const audioFileToBase64 = async ({ fileName }) => {
  const data = await fs.readFile(fileName);
  return data.toString("base64");
};


// new services
// HELPER BARU: Mengubah Base64 dari Hugging Face kembali ke File WAV untuk Rhubarb
export const saveBase64ToWav = async ({ base64String, fileName }) => {
  const buffer = Buffer.from(base64String, "base64");
  await fs.writeFile(fileName, buffer);
};

// HELPER BARU: Menghapus file temporary setelah lipsync selesai (supaya storage tidak penuh)
export const deleteFile = async ({ fileName }) => {
  try {
    await fs.unlink(fileName);
  } catch (err) {
    // Abaikan jika file sudah tidak ada
  }
};