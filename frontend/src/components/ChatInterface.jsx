import { useRef } from "react";
import { useSpeech } from "../hooks/useSpeech";
import { Send, AudioLines } from "lucide-react";

export const ChatInterface = ({ hidden, ...props }) => {
  const input = useRef();
  const { tts, loading, startRecording, stopRecording, recording, error } = useSpeech();

  // dummy response
  const staticResponse = "Halo! Aku Collexa, asisten belajarmu. Ada yang ingin kamu tanyakan tentang materi VClass hari ini?";

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && text) {
      tts(text);
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
        <p className="text-gray-600 whitespace-pre-line">
          {loading ? "Collexa sedang berpikir..." : "Asisten yang akan membantumu untuk belajar dan \nmemahami materi VClass."}
        </p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* bubble chat */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 max-w-xs w-full pointer-events-none">
        <div
          className="relative rounded-2xl px-4 py-3 text-white text-sm leading-relaxed"
          style={{
            background: "linear-gradient(135deg, #f472b6, #ec4899)",
            boxShadow: "0 8px 32px rgba(236,72,153,0.35), 0 2px 8px rgba(236,72,153,0.2)",
          }}
        >
          <span>{staticResponse}</span>
        </div>
      </div>

      <div className="pointer-events-auto max-w-screen-sm w-full mx-auto">
          <div
            className="rounded-3xl px-4 pt-4 pb-3 flex flex-col gap-3"
            style={{
              background: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1.5px solid rgba(255,255,255,0.8)",
            }}
          >
            {/* Input area */}
            <input
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-base px-1"
              placeholder="Tanyakan materi kuliah..."
              ref={input}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {/* Button row */}
            <div className="flex items-center justify-between">
              {/* Voice button */}
              <button
                disabled={loading}
                onClick={recording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-200 text-gray-600 text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 ${
                  recording ? "bg-red-100 border-red-300 text-red-500 animate-pulse" : "bg-white"
                }`}
              >
                <AudioLines size={16} />
                Voice
              </button>

              {/* Send button */}
              <button
                disabled={loading}
                onClick={sendMessage}
                className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white py-2 px-5 text-sm font-semibold rounded-full cursor-pointer disabled:opacity-30 transition-all duration-300"
              >
                <Send size={16} />
                Kirim
              </button>
            </div>
          </div>
        </div>
    </div>
    </>
  );
};