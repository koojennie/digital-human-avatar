import voice from "../../config/elevenLabs.js";

async function convertTextToSpeech({ text, fileName }) {
  await voice.textToSpeech({
    fileName: fileName,
    textInput: text,
    voiceId: voiceID,
    stability: 0.5,
    similarityBoost: 0.5,
    modelId: modelID,
    style: 1,
    speakerBoost: true,
  });
}

export { convertTextToSpeech };