import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useSpeechNew } from "../context/useSpeechNew";
import ChatBubbleNew from "./chat/ChatBubbleNew";

export const ChatInterface = ({ hidden, ...props }) => {
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  const {
    messages,
    sendMessage,
    sendAudioMessage,
    loading,
    loadingResponseAI,
    error: errorChat,
  } = useChat();

  const { recording, startRecording, stopRecording, speechError } =
    useSpeechNew({
      onAudioReady: (base64Audio) => {
        sendAudioMessage(base64Audio);
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
    }
  }, [loadingResponseAI]);

  const handleSend = () => {
    const text = inputRef.current.value;
    if (!loading && text.trim()) {
      sendMessage(text);
      inputRef.current.value = "";
    }
  };

  if (hidden) return null;

  const displayError = errorChat || speechError;

  return (
    <>
      {/* Background Layer */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      
      {/* Main Wrapper Layout */}
      <div className="fixed inset-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        
        {/* App Branding & Status Header */}
        <div className="self-start backdrop-blur-md bg-white/70 p-4 rounded-xl shadow-sm border border-white/40 pointer-events-auto max-w-xs transition-all">
          <h1 className="font-black text-xl text-gray-800 tracking-wide flex items-center gap-1.5">
            Collexa
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loadingResponseAI ? "bg-amber-400" : "bg-emerald-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${loadingResponseAI ? "bg-amber-500" : "bg-emerald-500"}`}></span>
            </span>
          </h1>
          <p className="text-gray-600 whitespace-pre-line text-xs mt-1 leading-relaxed">
            {loadingResponseAI
              ? "Collexa sedang berpikir..."
              : loading
                ? "Memuat riwayat chat..."
                : "Asisten cerdas pendamping belajar materi VClass kamu."}
          </p>
          {displayError && (
            <div className="text-red-500 mt-2 text-[11px] bg-red-50 p-2 rounded border border-red-100 font-medium animate-fade-in">
              ⚠️ {displayError}
            </div>
          )}
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 flex flex-col justify-end max-w-screen-sm w-full mx-auto pointer-events-auto p-2 mb-2">
          <div
            ref={chatContainerRef}
            className="w-full max-h-[320px] overflow-y-auto flex flex-col gap-3 p-2 scrollbar-thin scroll-smooth"
          >
            {messages.map((msg) => (
              <ChatBubbleNew key={msg.id} msg={msg}/>
            ))}

            {loadingResponseAI && (
              <div className="bg-white/80 backdrop-blur-sm text-gray-500 text-xs px-4 py-3 rounded-2xl rounded-bl-none self-start shadow-sm border border-gray-100 flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-gray-400">Collexa sedang mengetik...</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Bottom Input Controls Bar */}
        <div className="pointer-events-auto max-w-screen-sm w-full mx-auto bg-white/80 backdrop-blur-lg p-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2.5 transition-all">
          
          {/* Advanced Interactive Mic Button */}
          <div className="relative flex items-center justify-center">
            {recording && (
              <span className="absolute inline-flex h-full w-full rounded-xl bg-red-400 opacity-60 animate-ping"></span>
            )}
            <button
              disabled={loading || loadingResponseAI}
              onClick={recording ? stopRecording : startRecording}
              className={`relative p-3.5 rounded-xl text-white transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md ${
                recording
                  ? "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200"
                  : "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 shadow-gray-200"
              }`}
              title={recording ? "Klik untuk selesai merekam" : "Klik untuk bicara"}
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
            ref={inputRef}
            disabled={recording}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          {/* Premium Modern Send Button */}
          <button
            disabled={loading || loadingResponseAI || recording}
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-semibold transition-all duration-200 transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-blue-100 flex items-center justify-center flex-shrink-0"
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
    </>
  );
};