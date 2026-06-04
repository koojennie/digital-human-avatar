import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { chatService } from "../services/chat.services";
import { conversationService } from "../services/conversation.services";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  
  const queryParams = new URLSearchParams(window.location.search);
  const moodleUserId = queryParams.get("userId");

  const [messages, setMessages] = useState([]);
  // const [conversationId, setConversationId] = useState(
  //   "a91b2bea-0997-4d7a-8c57-8cd07598d453",
  // );
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const [avatarQueue, setAvatarQueue] = useState([]);
  const [currentAvatarMessage, setCurrentAvatarMessage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingResponseAI, setLoadingResponseAI] = useState(false);
  const [error, setError] = useState(null);

  const audioElementRef = useRef(null);
  const abortControllerRef = useRef(null);

  const interruptActiveAvatar = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
      console.log(
        "[AUDIO] Audio aktif berhasil dihentikan karena interopsi user.",
      );
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log(
        "[API] Request Gemini/HuggingFace sebelumnya berhasil dibatalkan.",
      );
    }

    setAvatarQueue([]);
    setCurrentAvatarMessage(null);
  }, []);

  const initializeChat = useCallback(async () => {
    if (
      !moodleUserId ||
      moodleUserId === "null" ||
      moodleUserId === "undefined"
    ) {
      console.log(
        "[INITIALIZE] Handshake gagal: moodleUserId tidak ditemukan.",
      );
      setError(
        "Identitas pengguna Moodle tidak terdeteksi. Mohon akses kembali dari halaman VClass.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const responseInit = await conversationService.initSessions({
        userId: moodleUserId,
      });

      const activeUserId = responseInit.data.user.userId;
      const activeConversationId = responseInit.data.conversation.id;

      setUserId(activeUserId);
      setConversationId(activeConversationId);
      setLoading(false);

      const responseHistory = await chatService.fetchHistoryChat({
        conversationId: activeConversationId,
        userId: activeUserId,
      });

      setMessages(responseHistory.data.messages || []);
      setAvatarQueue([]);
      setCurrentAvatarMessage(null);
      console.log("[INITIALIZE] Seluruh rangkaian proses handshake sukses dilakukan.");

    } catch (error) {
      console.error("error initialize", error);
      setError("Gagal menghubungkan sesi dengan server Avatar AI.");  
      setUserId(null);
      setConversationId(null);
    } finally {
      setLoading(false);
    }
  }, [moodleUserId]);

  useEffect(() => {
    initializeChat();

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };

  }, [initializeChat]);

  const sendMessage = async (text) => {
    interruptActiveAvatar();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingResponseAI(true);
    setError(null);

    const userDateSend = new Date().toISOString();

    const tempUserMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: userDateSend,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatService.sendMessage(
        {
          userId: userId,
          conversationId: conversationId,
          content: text,
          type: "text",
        },
        { signal: controller.signal },
      );

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
      if (err.name === "CanceledError" || err.name === "AbortError") {
        console.log("[API] Request di-abort dengan sukses.");
        return;
      }
      console.error("Gagal mengirim pesan:", err);
      setError("Gagal mengirim pesan.");

      // FIX BUG 2: Menggunakan tempUserMessage.id saat rollback UI gagal kirim
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempUserMessage.id),
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setLoadingResponseAI(false);
      }
    }
  };

  // send audio Message
  const sendAudioMessage = async (base64Audio) => {
    interruptActiveAvatar();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingResponseAI(true);
    setError(null);

    const userDateSend = new Date().toISOString();

    const tempUserMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: "🎙️ Mengirim pesan suara...",
      createdAt: userDateSend,
    };

    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await chatService.sendMessage(
        {
          userId: userId,
          conversationId: conversationId,
          voice: base64Audio,
          type: "voice",
        },
        { signal: controller.signal },
      );

      const { userMessage: savedUserMessage, aiMessages } = response.data;
      const safeAiMessages = Array.isArray(aiMessages)
        ? aiMessages
        : [aiMessages];

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== tempUserMessage.id),
        savedUserMessage, // savedUserMessage.content nanti otomatis berisi teks hasil transkripsi STT dari backend
        ...safeAiMessages,
      ]);

      setAvatarQueue((prev) => [...prev, ...safeAiMessages]);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error("Gagal mengirim audio:", err);
      setError("Gagal memproses pesan suara.");
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempUserMessage.id),
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setLoadingResponseAI(false);
      }
    }
  };

  useEffect(() => {
    if (avatarQueue.length === 0 || currentAvatarMessage) return;

    const nextMessage = avatarQueue[0];
    setCurrentAvatarMessage(nextMessage);

    let isCurrentEffectActive = true;
    let audio = null;

    if (nextMessage.audio) {
      const audioUrl = `data:audio/wav;base64,${nextMessage.audio}`;
      audio = new Audio(audioUrl);
      audioElementRef.current = audio;

      window.currentAvatarAudio = audio;

      audio.onended = () => {
        if (!isCurrentEffectActive) return;

        audioElementRef.current = null;
        window.currentAvatarAudio = null;

        setAvatarQueue((prev) => prev.slice(1));
        setCurrentAvatarMessage(null);
      };

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (e.name !== "AbortError") {
            console.error("Gagal melakukan auto-play suara avatar:", e);
          } else {
            console.log(
              "[AUDIO] Playback lama di-abort dengan aman untuk digantikan yang baru.",
            );
          }

          if (e.name !== "AbortError" && isCurrentEffectActive) {
            setAvatarQueue((prev) => prev.slice(1));
            setCurrentAvatarMessage(null);
          }
        });
      }
    } else {
      // Fallback jika response AI berupa teks statis tanpa audio berkas
      const timer = setTimeout(() => {
        if (isCurrentEffectActive) {
          setAvatarQueue((prev) => prev.slice(1));
          setCurrentAvatarMessage(null);
        }
      }, 3000);

      return () => {
        isCurrentEffectActive = false;
        clearTimeout(timer);
      };
    }

    return () => {
      isCurrentEffectActive = false;

      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log(
          "[CLEANUP] Berhasil mencegah tumpang tindih duplikasi audio.",
        );
      }
    };
  }, [avatarQueue, currentAvatarMessage]);

  const onAvatarMessagePlayed = useCallback(() => {
    setAvatarQueue((prev) => {
      const nextQueue = prev.slice(1);

      if (nextQueue.length === 0) {
        setCurrentAvatarMessage(null); // <--- KUNCI UTAMA: Buka gembok tombol mic!
        console.log(
          "[CONTEXT] Seluruh antrean suara habis. Mikrofon dibuka kembali.",
        );
      } else {
        setCurrentAvatarMessage(nextQueue[0]);
      }

      return nextQueue;
    });
  }, []);

  const value = useMemo(
    () => ({
      messages,
      sendMessage,
      sendAudioMessage,
      currentAvatarMessage,
      interruptActiveAvatar,
      onAvatarMessagePlayed,
      loading,
      loadingResponseAI,
      error,
    }),
    [
      messages,
      sendAudioMessage,
      currentAvatarMessage,
      interruptActiveAvatar,
      onAvatarMessagePlayed,
      loading,
      loadingResponseAI,
      error,
    ],
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
