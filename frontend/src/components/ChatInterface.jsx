import { useRef, useState, useEffect } from "react"; // 1. Ditambahkan useEffect
import { Send, AudioLines, ReceiptCent, SendHorizontal } from "lucide-react";
import { useLiveSpeech } from "../context/useLiveSpeech";
import { useChat } from "../context/ChatContext";
import ChatBubbleNew from "./chat/ChatBubbleNew";

export const ChatInterface = ({ hidden, ...props }) => {
  const chatContainerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  const {
    messages,
    sendMessage,
    currentAvatarMessage,
    loading,
    loadingResponseAI,
    error: errorChat,
  } = useChat();

  const [activeCaption, setActiveCaption] = useState(null);
  const [showCaption, setShowCaption] = useState(false);
  const fadeTimeoutRef = useRef(null);
  const cleanTimeoutRef = useRef(null);

  // dummy response
  const staticResponse =
    "Halo! Aku Collexa, asisten belajarmu. Ada yang ingin kamu tanyakan tentang materi VClass hari ini?";

  const { recording, startLiveRecording, stopLiveRecording, speechError } =
    useLiveSpeech({
      onTranscriptChange: (liveText) => {
        setInputValue(liveText);
      },
    });

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (loadingResponseAI) {
      scrollToBottom();
      setShowCaption(false);
      setActiveCaption("");
    }
  }, [loadingResponseAI]);

  useEffect(() => {
    if (currentAvatarMessage && currentAvatarMessage.role === "assistant") {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (cleanTimeoutRef.current) clearTimeout(cleanTimeoutRef.current);

      setActiveCaption(currentAvatarMessage.content);
      setShowCaption(true);
    }

    if (!currentAvatarMessage && activeCaption && !loadingResponseAI) {
      console.log(
        "[CAPTION] Audio selesai diputar. Menunggu 5 detik sebelum memudarkan teks.",
      );

      fadeTimeoutRef.current = setTimeout(() => {
        setShowCaption(false);
      }, 5000);

      cleanTimeoutRef.current = setTimeout(() => {
        setActiveCaption("");
      }, 5500);
    }

    return () => {
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      if (cleanTimeoutRef.current) clearTimeout(cleanTimeoutRef.current);
    };
  }, [currentAvatarMessage, loadingResponseAI, activeCaption]);

  const handleSend = () => {
    if (!loading && inputValue.trim()) {
      if (recording) {
        stopLiveRecording();
      }
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    if (loadingResponseAI && recording) {
      console.log(
        "[SPEECH] Mematikan mikrofon secara otomatis karena bot mulai merespons.",
      );
      stopLiveRecording();
    }
  }, [loadingResponseAI, recording, stopLiveRecording]);

  if (hidden) return null;

  const displayError = errorChat || speechError;

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="fixed inset-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        {/* Header info */}
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg pointer-events-auto">
          <h1 className="font-black text-xl text-gray-700">Collexa</h1>
          <p className="text-gray-600 whitespace-pre-line">
            {loading
              ? "Collexa sedang berpikir..."
              : "An assistant that will help you learn and understand VClass materials."}
          </p>
          {displayError && (
            <p className="text-red-500 mt-2"> ⚠️ {displayError}</p>
          )}
        </div>

        {/* Bubble Chat Dummy (Kanan) */}
        {/* INTERACTIVE IDEA: FLOATING RIGHT CHAT STREAM */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 max-w-xs w-full flex flex-col gap-3 pointer-events-auto z-20">
          {/* Tampilkan pesan error di dalam list kanan jika terjadi kegagalan sistem */}
          {displayError && (
            <div className="rounded-2xl px-4 py-3 text-white text-xs leading-relaxed bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/20 animate-bounce flex items-center gap-2">
              <span>⚠️</span>
              <p>{displayError}</p>
            </div>
          )}

          {activeCaption && (
            <div
              className={`relative rounded-2xl px-4 py-3 text-white text-sm leading-relaxed shadow-lg border border-white/20 transition-all duration-500 ease-in-out transform backdrop-blur-md ${
                showCaption
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-2 scale-95 pointer-events-none"
              }`}
              style={{
                background: "linear-gradient(135deg, #f472b6, #ec4899)",
                boxShadow:
                  "0 8px 24px rgba(236,72,153,0.3), 0 2px 6px rgba(236,72,153,0.15)",
              }}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">
                Collexa AI
              </span>
              <p className="font-normal text-[13px] leading-relaxed">
                {activeCaption}
              </p>
            </div>
          )}

          {/* Animasi Pulse Indikator Mengetik dari Bot */}
          {loadingResponseAI && (
            <div
              className="rounded-2xl px-4 py-3 text-white text-xs leading-relaxed shadow-md border border-white/20 flex items-center gap-2 self-start transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #f472b6, #ec4899)",
                opacity: 0.8,
              }}
            >
              <div className="flex gap-1 items-center">
                <span
                  className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
              <span className="font-medium">
                Collexa sedang menyusun materi...
              </span>
            </div>
          )}
        </div>

        <div className="pointer-events-auto max-w-screen-sm w-full mx-auto flex flex-col gap-4">
          {/* Interactive Bottom Input Controls Bar */}
          <div className="w-full bg-white/80 backdrop-blur-lg p-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2.5 transition-all">
            {/* Advanced Interactive Mic Button */}
            <div className="relative flex items-center justify-center">
              {recording && (
                <span className="absolute inline-flex h-full w-full rounded-xl bg-red-400 opacity-60 animate-ping"></span>
              )}
              <button
                disabled={loading || loadingResponseAI || currentAvatarMessage}
                onClick={recording ? stopLiveRecording : startLiveRecording}
                className={`cursor-pointer transition-all ease-in duration-300 relative p-3.5 rounded-xl text-white transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md ${
                  recording
                    ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-gray-200"
                }`}
                title={
                  recording ? "Klik untuk selesai merekam" : "Klik untuk bicara"
                }
              >
                <AudioLines size={18}/>
              </button>
            </div>

            {/* Text Input Field */}
            <input
              className={`w-full py-3 px-4 rounded-xl bg-gray-50/50 outline-none text-sm transition-all border ${
                recording
                  ? "border-red-300 bg-red-50/30 text-red-900 placeholder-red-400 italic"
                  : "border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-400"
              }`}
              placeholder={
                recording
                  ? "Listening to your voice... tap the red button when finished"
                  : "Ask about the lecture material here..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={recording}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            {/* Premium Modern Send Button */}
            <button
              disabled={loading || loadingResponseAI || recording}
              onClick={handleSend}
              className="bg-pink-600 hover:bg-pink-700 text-white p-3.5 rounded-xl font-semibold cursor-pointer transition-all duration-200 transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-blue-100 flex items-center justify-center flex-shrink-0"
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
