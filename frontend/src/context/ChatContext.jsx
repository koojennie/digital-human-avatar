import { createContext, useContext, useState, useEffect } from "react";

import { chatService } from "../services/chat.services";
import { useCallback, useMemo } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  const queryParams = new URLSearchParams(window.location.search);
  // const conversationId = queryParams.get("conversationId");

  // const userId = '5fc62266-597f-4b1b-9e01-b5abed5b2542';
  const userId = queryParams.get("userId");  


  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(
    "a91b2bea-0997-4d7a-8c57-8cd07598d453",
  );

  const [loading, setLoading] = useState(false);
  const [loadingResponseAI, setLoadingResponseAI] = useState(false);

  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await chatService.fetchHistoryChat({
        conversationId: conversationId,
        userId: userId,
      });

      
      setMessages(response.data.messages);
    } catch (err) {
      console.error("Failed Fetch History Chat", err);
      setError("Gagal memuat riwayat percakapan.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Panggil fetchHistory saat komponen pertama kali dirender
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sendMessage = async (text) => {
    setLoadingResponseAI(true);

    const userDateSend = new Date().toISOString();
    // 1. Optimistic UI: Tampilkan pesan pengguna langsung
    const userMessage = {
      id: crypto.randomUUID(), // ID sementara
      role: "user",
      content: text,
      createdAt: userDateSend,
    };
    setMessages((prev) => [...prev, userMessage]);

    setError(null);

    try {
      const response = await chatService.sendMessage({
        userId: "5fc62266-597f-4b1b-9e01-b5abed5b2542",
        conversationId: conversationId,
        content: text,
      });


      const { userMessage: savedUserMessage, aiMessages } = response.data;

      // 3. Ganti pesan sementara dengan data asli dari server dan tambahkan balasan AI
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== userMessage.id), // Hapus pesan sementara
        savedUserMessage, // Tambah pesan user dari DB
        ...aiMessages, // Tambah balasan AI (sebagai array)
      ]);

    } catch (err) {
      console.error(err);
      setError("Failed send message");
      // Jika gagal, hapus pesan sementara dari UI
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setLoadingResponseAI(false);
    }
  };

  const value = useMemo(
    () => ({
      messages,
      sendMessage,
      loading,
      loadingResponseAI,
      error,
    }),
    [messages, loading, loadingResponseAI, error],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error("useChat must be used inside provider");
  }

  return context;
};
