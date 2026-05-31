import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export class HuggingFaceService {
  // generate Speech
  async generateSpeech(text) {
    const response = await fetch(`${process.env.HUGGINGFACE_URL_API}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate speech");
    }

    return await response.json();
  }

  async convertSoundToText(audio) {
    const response = await fetch(`${process.env.HUGGINGFACE_URL_API}/stt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: audio,
      }),
    });
    
    let result;
    try {
      result = await response.json();
    } catch (err) {
      if (!response.ok) {
        throw new Error(`Failed to convert sound to text. Status: ${response.status}`);
      }
      throw err;
    }
    
    if (!response.ok) {
      let errorMessage = result.detail || result.error || "Failed to convert sound to text";
      if (typeof errorMessage === 'object') errorMessage = JSON.stringify(errorMessage);
      throw new Error(errorMessage);
    }

    return result;
  }
}
