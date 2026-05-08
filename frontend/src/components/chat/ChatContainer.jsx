
import { useChat }
from "../../context/ChatContext";

import ChatBubble
from "./ChatBubble";

export default function ChatContainer() {

  const { messages } =
    useChat();

  return (
    <div className="flex flex-col gap-4 p-4">

      {messages.map((message) => (

        <ChatBubble
          key={message.id}
          message={message}
        />

      ))}

    </div>
  );
}