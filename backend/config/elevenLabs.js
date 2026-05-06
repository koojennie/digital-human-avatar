import ElevenLabs from "elevenlabs-node";
import dotenv from "dotenv";

dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = process.env.ELEVEN_LABS_VOICE_ID;
const modelID = process.env.ELEVEN_LABS_MODEL_ID || "eleven_monolingual_v1";

const voice = new ElevenLabs({
  apiKey: elevenLabsApiKey,
  voiceId: voiceID,
});


export default voice;