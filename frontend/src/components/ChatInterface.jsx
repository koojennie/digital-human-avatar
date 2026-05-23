import { useRef } from "react";
import { useSpeech } from "../hooks/useSpeech";
import { useChat } from "../context/ChatContext";

export const ChatInterface = ({ hidden, ...props }) => {
  const input = useRef();
  // const { tts, loading, startRecording, stopRecording, recording, error } = useSpeech();
  const { messages, sendMessage, loading, loadingResponseAI, error } =
    useChat();

  const handleSend = () => {
    const text = input.current.value;
    if (!loading && text) {
      // tts(text);
      sendMessage(text);
      input.current.value = "";
    }
  };

  if (hidden) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="fixed inset-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl text-gray-700">Collexa</h1>
          <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
            {loadingResponseAI
              ? "Collexa sedang berpikir..."
              : loading
                ? "Memuat riwayat chat..."
                : "Asisten yang akan membantumu untuk belajar dan \nmemahami materi VClass."}
          </p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="flex-1 flex flex-col justify-end max-w-screen-sm w-full mx-auto pointer-events-auto p-2">
          {/* Batasi tinggi di sini (max-h-[260px] kira-kira muat 2-3 bubble pendek) */}
          <div className="w-full max-h-[260px] overflow-y-auto flex flex-col gap-2 p-2 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[75%] p-3 rounded-lg text-sm shadow-sm transition-all ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white self-end rounded-br-none"
                    : "bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 self-start rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
              </div>
            ))}

            {loadingResponseAI && (
              <div className="bg-white bg-opacity-60 backdrop-blur-sm text-gray-500 text-xs p-3 rounded-lg self-start animate-pulse shadow-sm">
                Collexa sedang mengetik dan menyiapkan suara...
              </div>
            )}

            {/* Dummy div untuk kebutuhan Auto Scroll ke bawah */}
            {/* <div ref={messagesEndRef} /> */}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          {/* <button
            disabled={loading}
            onClick={recording ? stopRecording : startRecording}
            className={`bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-md ${
              recording ? "bg-red-500 animate-pulse" : ""
            } disabled:cursor-not-allowed disabled:opacity-30`}
          > */}
          {/* Icon Mic */}
          {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
          </button> */}

          <input
            className="w-full p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md outline-none"
            placeholder="Tanyakan materi kuliah..."
            ref={input}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button
            disabled={loading}
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 px-10 font-semibold uppercase rounded-md disabled:opacity-30"
          >
            Kirim
          </button>
        </div>
      </div>
    </>
  );
};
