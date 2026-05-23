import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { chatService } from "../services/chat.services";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("userId");

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(
    "a91b2bea-0997-4d7a-8c57-8cd07598d453",
  );

  const [avatarQueue, setAvatarQueue] = useState([]);
  const [currentAvatarMessage, setCurrentAvatarMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingResponseAI, setLoadingResponseAI] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (
      !conversationId ||
      !userId ||
      userId === "null" ||
      userId === "undefined"
    ) {
      console.log(
        "Fetch History dibatalkan: Parameter userId belum siap atau tidak ditemukan.",
      );
      return;
    }
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
  }, [conversationId, userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sendMessage = async (text) => {
    setLoadingResponseAI(true);
    setError(null);

    const userDateSend = new Date().toISOString();

    // 1. Optimistic UI: Buat objek dengan variabel tempUserMessage
    const tempUserMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: userDateSend,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatService.sendMessage({
        userId: userId,
        conversationId: conversationId,
        content: text,
      });

      console.log("here the reponse sendMessage chatServices", response);

      const { userMessage: savedUserMessage, aiMessages } = response.data;

      const safeAiMessages = Array.isArray(aiMessages)
        ? aiMessages
        : [aiMessages];

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== tempUserMessage.id),
        savedUserMessage,
        ...safeAiMessages,
      ]);

      setAvatarQueue((prev) => [...prev, ...safeAiMessages]);
    } catch (err) {
      console.error(err);
      setError("Failed send message");

      // FIX BUG 2: Menggunakan tempUserMessage.id saat rollback UI gagal kirim
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempUserMessage.id),
      );
    } finally {
      setLoadingResponseAI(false);
    }
  };

  useEffect(() => {
    if (avatarQueue.length > 0) {
      setCurrentAvatarMessage(avatarQueue[0]);
    } else {
      setCurrentAvatarMessage(null);
    }
  }, [avatarQueue]);

  const onAvatarMessagePlayed = () => {
    setAvatarQueue((prev) => prev.slice(1));
  };

  const value = useMemo(
    () => ({
      messages,
      sendMessage,
      currentAvatarMessage,
      onAvatarMessagePlayed,
      loading,
      loadingResponseAI,
      error,
    }),
    [messages, currentAvatarMessage, loading, loadingResponseAI, error],
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
