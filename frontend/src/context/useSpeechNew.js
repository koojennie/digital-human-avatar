import { useState, useRef } from "react";

export const useSpeechNew = ({ onAudioReady }) => {
  const [recording, setRecording] = useState(false);
  const [speechError, setSpeechError] = useState(false);
  const mediaRecordRef = useRef(null);
  const audioChunkRef = useRef([]);

  const startRecording = async () => {
    setSpeechError(false);
    audioChunkRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const options = { mimeType: "audio/webm" };
      const recorder = new MediaRecorder(stream, options);

      mediaRecordRef.current = recorder;

      recorder.ondataavailable = (e) => {
        audioChunkRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunkRef.current, {
          type: "audio/webm",
        });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);

        reader.onloadend = () => {
          const base64Audio = reader.result.split(",")[1];
          if (onAudioReady) {
            onAudioReady(base64Audio);
          }
        };

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start()
      setRecording(true);
    } catch (e) {
      console.log("Gagal mengakses mikrofon: ", e);
      setSpeechError("Izin mikronfon ditolak atau tidak di temukan");
    }
  };

  const stopRecording = () => {
    if(mediaRecordRef.current && recording){
      mediaRecordRef.current.stop();
      setRecording(false);
    }
  }

  return {
    recording, 
    startRecording,
    stopRecording,
    speechError
  }
};
