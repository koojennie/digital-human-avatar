import ChatContainer from "../components/Chat/ChatContainer";
import ChatInput from "../components/Chat/ChatInput";

export default function ChatPage() {
  return (
    <>
      {/* Background Image & Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="flex flex-col h-screen items-center justify-center p-4 bg-black/10 backdrop-blur-sm">
        {/* Chat Window */}
        <div className="w-full max-w-4xl h-full flex flex-col bg-white/80 shadow-2xl rounded-xl">
          {/* Header */}
          <header className="p-4 border-b border-gray-300/50">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Chat with Collexa
            </h1>
          </header>

          {/* Message Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <ChatContainer />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-300/50">
            <ChatInput />
          </div>
        </div>
      </div>
    </>
  );
}
