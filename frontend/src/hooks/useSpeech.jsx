import { createContext, useContext, useEffect, useRef, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chunksRef = useRef([]);

  const initiateRecording = () => {
    chunksRef.current = [];
  };

  const onDataAvailable = (e) => {
    chunksRef.current.push(e.data);
  };

  const sendAudioData = (audioBlob) => {
    return new Promise((resolve, reject) => {
      setError(null);
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onerror = reject;
      reader.onloadend = async function () {
        const base64Audio = reader.result.split(",")[1];
        setLoading(true);
        try {
          const data = await fetch(`${backendUrl}/sts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64Audio }),
          });
          const response = (await data.json()).messages;
          setMessages((messages) => [...messages, ...response]);
          resolve();
        } catch (e) {
          console.error(e);
          setError("Gagal memproses audio. Silakan coba lagi.");
          reject(e);
        } finally {
          setLoading(false);
        }
      };
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const newMediaRecorder = new MediaRecorder(stream);
          newMediaRecorder.onstart = initiateRecording;
          newMediaRecorder.ondataavailable = onDataAvailable;
          newMediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
            await sendAudioData(audioBlob);
          };
          setMediaRecorder(newMediaRecorder);
        })
        .catch((err) => {
          console.error("Error microphone:", err);
          setError("Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin.");
        });
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const tts = async (text) => {
    setError(null);
    setLoading(true);
    console.log('here the text input', text);
    
    try {
      const data = await fetch(`${backendUrl}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const response = (await data.json()).messages;
      console.log('here the response', response);
      setMessages((messages) => [...messages, ...response]);
    } catch (e) {
      console.error(e);
      setError("Gagal memproses pesan Anda. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <SpeechContext.Provider
      value={{
        startRecording,
        stopRecording,
        recording,
        tts,
        message,
        onMessagePlayed,
        loading,
        error,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (!context) throw new Error("useSpeech must be used within SpeechProvider");
  return context;
};