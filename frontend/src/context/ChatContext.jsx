import { createContext, useContext, useState } from "react";

import { chatService } from "../services/chat.services";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const sendMessage = async (text) => {
    try {
      setLoading(true);

      // optimistic user message
      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);

      const response = await chatService.sendMessage({
        userId: "5fc62266-597f-4b1b-9e01-b5abed5b2542",

        conversationId: "a91b2bea-0997-4d7a-8c57-8cd07598d453",

        content: text,
      });

      const aiMessages = response.data.aiMessages;

      setMessages((prev) => [...prev, ...aiMessages]);
    } catch (err) {
      console.error(err);

      setError("Failed send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside provider");
  }

  return context;
};
