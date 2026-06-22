import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  User as UserIcon,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card } from "../../components/Admin/Card";
import { chatLogService } from "../../services/chatlog.service";

export default function ChatLogView() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState();
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // Load daftar sesi (Kiri)
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const responseAllSessions =
          await chatLogService.fetchAllSessionConversationLog();
        const result = responseAllSessions.data;

        setSessions(result.rows);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    loadSessions();
  }, []);

  // Load detail chat ketika sesi diklik (Kanan)
  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    setLoadingChat(true);

    try {
      const response = await chatLogService.getMessagesDetailLog(
        session.conversation_id,
      );
      setMessages(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* KIRI: DAFTAR SESI MAHASISWA */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl overflow-y-auto p-4 space-y-3">
        <h3 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">
          <MessageSquare size={16} className="text-pink-500" /> Live Chat
          Sessions
        </h3>
        {loadingList ? (
          <p className="text-xs text-slate-400">Loading sessions...</p>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.conversation_id}
              onClick={() => handleSelectSession(sess)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedSession?.conversation_id === sess.conversation_id
                  ? "bg-indigo-50/70 border-indigo-200"
                  : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-bold text-slate-800">
                {sess.user?.full_name || "Student"}
              </p>
              <p className="text-[10px] text-slate-400">
                @{sess.user?.username}
              </p>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                <span className="truncate max-w-[120px] bg-slate-100 px-2 py-0.5 rounded-md">
                  {sess.course?.fullname || "VClass Course"}
                </span>
                <span>
                {new Date(sess.last_message_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* KANAN: BUBBLE INTERAKSI CHAT REAL */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl flex flex-col p-6 overflow-hidden">
        {selectedSession ? (
          <>
            {/* Header Chat Info */}
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {selectedSession.user?.full_name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Topik: {selectedSession.title || "Diskusi Bebas"}
              </p>
            </div>

            {/* View Port Chat Bubbles */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {loadingChat ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Memuat histori obrolan...
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`flex flex-col max-w-[75%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-slate-800 text-white rounded-br-none"
                          : "text-white rounded-bl-none"
                      }`}
                      style={
                        msg.role !== "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #f472b6, #ec4899)",
                            }
                          : {}
                      }
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">
                      {msg.type === "voice" ? "🎙️ Voice" : "⌨️ Text"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
            <MessageSquare size={32} className="opacity-30" />
            <p>
              Pilih salah satu sesi mahasiswa di sebelah kiri untuk mengaudit
              percakapan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
