//import fetch from "node-fetch";

export class TtsService {
  async generateSpeech(text) {
    const response = await fetch(
      "https://risqikhasani-avatar-tts-vclass.hf.space/tts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      }
    );

    if(!response.ok){
      throw new Error("Failed to generate speech");
    }

    return await response.json();
  }
}
