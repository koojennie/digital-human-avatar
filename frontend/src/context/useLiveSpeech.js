import { useState, useEffect, useRef } from "react";

export const useLiveSpeech = ({ onTranscriptChange }) => {
  const [recording, setRecording] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        "Browser kamu tidak mendukung Live Voice Search. Silakan gunakan Google Chrome.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = "id-ID";
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Gabungkan hasil akhir dan hasil sementara (efek mengetik berjalan)
      const liveText = finalTranscript || interimTranscript;
      if (onTranscriptChange) {
        onTranscriptChange(liveText);
      }

      if (event.results[event.results.length - 1].isFinal) {
        recognition.stop();
        setRecording(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setRecording(false);

      switch (event.error) {
        case "not-allowed":
          setSpeechError(
            "Akses mikrofon ditolak. Mohon izinkan mic pada pengaturan browser Anda.",
          );
          break;
        case "no-speech":
          setSpeechError(
            "Suara tidak terdengar. Silakan coba klik tombol mic dan bicara kembali.",
          );
          break;
        case "network":
          setSpeechError(
            "Koneksi internet bermasalah untuk memproses transkripsi suara.",
          );
          break;
        default:
          setSpeechError("Gagal mendeteksi suara. Silakan coba lagi.");
      }
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscriptChange]);

  const startLiveRecording = () => {
    if (recognitionRef.current && !recording) {
      setSpeechError(null);
      recognitionRef.current.start();
      setRecording(true);
    }
  };

  const stopLiveRecording = () => {
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop();
      setRecording(false);
    }
  };

  return {
    recording,
    startLiveRecording,
    stopLiveRecording,
    speechError,
  };
};
