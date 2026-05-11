import { useChat } from "../../context/ChatContext";
import ChatBubble from "./ChatBubble";
import { useRef, useEffect } from "react";

export default function ChatContainer() {
  const { messages, loading, loadingResponseAI, error } = useChat();
  const endOfMessagesRef = useRef(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingResponseAI]);

  // Tampilkan indikator loading saat pertama kali memuat riwayat
  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 animate-pulse">
          Memuat riwayat percakapan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Belum ada pesan. Mulai percakapan!</p>
      </div>
    );
  }


  return (
    <>
      {messages.map((msg) => (
        <ChatBubble key={msg.id} msg={msg} />
      ))}

      {loadingResponseAI && (
        <div className="flex items-start gap-3">
          {/* Assistant Avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1 border border-indigo-200">
            <span className="text-indigo-500 font-bold text-sm">AI</span>
          </div>
          {/* Typing Indicator Bubble */}
          <div className="max-w-md xl:max-w-lg px-4 py-3 rounded-2xl shadow-lg bg-white text-gray-800 rounded-bl-lg">
            <div className="flex items-center justify-center space-x-1.5 h-5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={endOfMessagesRef} />
    </>
  );
}
