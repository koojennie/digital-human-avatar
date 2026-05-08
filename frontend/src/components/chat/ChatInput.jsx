import { useState } from "react";

import { useChat } from "../../context/ChatContext";

export default function ChatInput() {
  const [text, setText] = useState("");

  const { sendMessage, loading } = useChat();

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage(text);

    setText("");
  };

  return (
    <div className="flex gap-2 p-4">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="
          flex-1
          border
          rounded-xl
          px-4
          py-2
        "
      />

      <button onClick={handleSend} disabled={loading}>
        Send
      </button>
    </div>
  );
}
