import { useRef, useState, useEffect } from "react"; // 1. Ditambahkan useEffect
import { Send, AudioLines, ReceiptCent } from "lucide-react";
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
              : "Asisten yang akan membantumu untuk belajar dan \nmemahami materi VClass."}
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

        {/* <div className="fixed right-6 top-1/2 -translate-y-1/2 max-w-xs w-full pointer-events-none">
          <div
            className="relative rounded-2xl px-4 py-3 text-white text-sm leading-relaxed"
            style={{
              background: "linear-gradient(135deg, #f472b6, #ec4899)",
              boxShadow:
                "0 8px 32px rgba(236,72,153,0.35), 0 2px 8px rgba(236,72,153,0.2)",
            }}
          >
            <span>{staticResponse}</span>
          </div>
        </div> */}

        {/* Container Utama Chat (Tengah - Bawah) */}
        <div className="pointer-events-auto max-w-screen-sm w-full mx-auto flex flex-col gap-4">
          {/* <div
            ref={chatContainerRef}
            className="w-full h-[320px] overflow-y-auto flex flex-col gap-3 p-4 rounded-3xl scrollbar-thin scroll-smooth justify-center"
            style={{
              background: "white",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1.5px solid rgba(255,255,255,0.8)",
            }}
          >
            {displayError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center animate-fade-in my-auto">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xl font-bold shadow-sm mb-3">
                  ⚠️
                </div>
                <h3 className="text-gray-800 font-bold text-sm tracking-wide">
                  Koneksi Diskusi Terganggu
                </h3>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed bg-gray-50/80 p-3.5 rounded-xl border border-gray-100 max-w-sm">
                  {displayError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[11px] bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95"
                >
                  Muat Ulang Halaman
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto flex flex-col gap-3">
                  {messages.map((msg, index) => (
                    
                    <ChatBubbleNew key={index} msg={msg} />
                  ))}
                </div>

                {loadingResponseAI && (
                  <div className="bg-white/80 backdrop-blur-sm text-gray-500 text-xs px-4 py-3 rounded-2xl rounded-bl-none self-start shadow-sm border border-gray-100 flex items-center gap-2 mt-auto">
                    <div className="flex gap-1 items-center">
                      <span
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                    <span className="text-gray-400">
                      Collexa sedang mengetik...
                    </span>
                  </div>
                )}
              </>
            )}
          </div> */}

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
                className={`relative p-3.5 rounded-xl text-white transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md ${
                  recording
                    ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-gray-200"
                }`}
                title={
                  recording ? "Klik untuk selesai merekam" : "Klik untuk bicara"
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-5 h-5 ${recording ? "animate-pulse" : ""}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
              </button>
            </div>

            {/* Text Input Field */}
            <input
              className={`w-full py-3 px-4 rounded-xl bg-gray-50/50 outline-none text-sm transition-all border ${
                recording
                  ? "border-red-300 bg-red-50/30 text-red-900 placeholder-red-400 italic"
                  : "border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              }`}
              placeholder={
                recording
                  ? "Mendengarkan suaramu... ketuk tombol merah jika selesai"
                  : "Tanyakan materi perkuliahan di sini..."
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
              className="bg-pink-600 hover:bg-pink-700 text-white p-3.5 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-blue-100 flex items-center justify-center flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 transform rotate-45 -translate-x-0.5 translate-y-0.5"
              >
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
