import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  RotateCcw,
  Calendar,
  X,
  BookOpen,
  UserCheck,
  ArrowUpDown,
} from "lucide-react";
import { chatLogService } from "../../services/chatlog.service";

export default function ChatLogView() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  // 🎯 State Filter Client-Side
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  
  // 🎯 State Sorting (default: 'desc' / terbaru ke terlama)
  const [sortOrder, setSortOrder] = useState("desc");

  // Filter Tanggal Akun User Dibuat
  const [userCreatedStart, setUserCreatedStart] = useState("");
  const [userCreatedEnd, setUserCreatedEnd] = useState("");

  // Filter Tanggal Chat Terakhir
  const [lastMsgStart, setLastMsgStart] = useState("");
  const [lastMsgEnd, setLastMsgEnd] = useState("");

  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Load daftar sesi (Kiri)
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const responseAllSessions =
          await chatLogService.fetchAllSessionConversationLog();
        const result = responseAllSessions.data;

        setSessions(result.rows || []);
      } catch (err) {
        console.error("Gagal memuat daftar sesi chat:", err);
      } finally {
        setLoadingList(false);
      }
    };
    loadSessions();
  }, []);

  // Ambil Daftar Mata Kuliah Unik untuk Dropdown
  const uniqueCourses = useMemo(() => {
    const courseList = sessions
      .map((s) => s.course?.fullname)
      .filter((name) => Boolean(name));
    return [...new Set(courseList)].sort();
  }, [sessions]);

  // 🎯 Logika Filter & Sorting Sesi Chat
  const filteredAndSortedSessions = useMemo(() => {
    // Step 1: Filter Data
    const filtered = sessions.filter((sess) => {
      // 1. Text Search (Nama Mahasiswa, Username, atau Judul Diskusi)
      const nameMatch = sess.user?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const usernameMatch = sess.user?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const titleMatch = sess.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || usernameMatch || titleMatch;

      // 2. Filter Mata Kuliah (Course)
      const matchesCourse =
        selectedCourse === "ALL" || sess.course?.fullname === selectedCourse;

      // 3. Filter Tanggal Akun User Dibuat (user.created_at)
      let matchesUserCreated = true;
      const userCreatedDate = sess.user?.created_at
        ? new Date(sess.user.created_at).setHours(0, 0, 0, 0)
        : null;

      if (userCreatedDate) {
        if (userCreatedStart) {
          const start = new Date(userCreatedStart).setHours(0, 0, 0, 0);
          if (userCreatedDate < start) matchesUserCreated = false;
        }
        if (userCreatedEnd) {
          const end = new Date(userCreatedEnd).setHours(0, 0, 0, 0);
          if (userCreatedDate > end) matchesUserCreated = false;
        }
      }

      // 4. Filter Rentang Tanggal Last Message
      let matchesLastMsg = true;
      if (sess.last_message_at) {
        const sessionDate = new Date(sess.last_message_at).setHours(0, 0, 0, 0);
        if (lastMsgStart) {
          const start = new Date(lastMsgStart).setHours(0, 0, 0, 0);
          if (sessionDate < start) matchesLastMsg = false;
        }
        if (lastMsgEnd) {
          const end = new Date(lastMsgEnd).setHours(0, 0, 0, 0);
          if (sessionDate > end) matchesLastMsg = false;
        }
      }

      return (
        matchesSearch &&
        matchesCourse &&
        matchesUserCreated &&
        matchesLastMsg
      );
    });

    // 🎯 Step 2: Sorting Berdasarkan last_message_at (Terbaru / Terlama)
    return filtered.sort((a, b) => {
      const timeA = new Date(a.last_message_at || 0).getTime();
      const timeB = new Date(b.last_message_at || 0).getTime();

      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
  }, [
    sessions,
    searchTerm,
    selectedCourse,
    userCreatedStart,
    userCreatedEnd,
    lastMsgStart,
    lastMsgEnd,
    sortOrder,
  ]);

  // Load detail chat ketika sesi diklik (Kanan)
  const handleSelectSession = async (session) => {
    setSelectedSession(session);
    setLoadingChat(true);

    try {
      const response = await chatLogService.getMessagesDetailLog(
        session.conversation_id
      );
      setMessages(response.data || []);
    } catch (err) {
      console.error("Gagal memuat riwayat pesan:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCourse("ALL");
    setUserCreatedStart("");
    setUserCreatedEnd("");
    setLastMsgStart("");
    setLastMsgEnd("");
    setSortOrder("desc");
  };

  const isFilterActive =
    searchTerm !== "" ||
    selectedCourse !== "ALL" ||
    userCreatedStart !== "" ||
    userCreatedEnd !== "" ||
    lastMsgStart !== "" ||
    lastMsgEnd !== "" ||
    sortOrder !== "desc";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* KIRI: DAFTAR SESI MAHASISWA & FILTER */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl flex flex-col p-4 overflow-hidden">
        
        {/* Header Kiri */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <MessageSquare size={16} className="text-pink-500" />
            Live Chat Sessions
          </h3>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
              showFilterPanel || isFilterActive
                ? "bg-pink-50 border-pink-300 text-pink-600"
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
            title="Toggle Filter Panel"
          >
            <Filter size={13} />
            {isFilterActive && (
              <span className="w-2 h-2 rounded-full bg-pink-600"></span>
            )}
          </button>
        </div>

        {/* Quick Search Bar & Sort Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari nama, username, atau topik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* 🎯 TOGGLE SORTING CHAT TERBARU / TERLAMA */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
            title={sortOrder === "desc" ? "Urutkan: Chat Terbaru" : "Urutkan: Chat Terlama"}
          >
            <ArrowUpDown size={13} className="text-pink-600" />
            <span className="text-[11px]">{sortOrder === "desc" ? "Terbaru" : "Terlama"}</span>
          </button>
        </div>

        {/* EXPANDABLE FILTER PANEL */}
        {showFilterPanel && (
          <div className="p-3 mb-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 max-h-[260px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[11px] font-bold text-slate-700">
                Filter Detail
              </span>
              {isFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] text-pink-600 hover:text-pink-800 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw size={10} /> Reset All
                </button>
              )}
            </div>

            {/* 🎯 Dropdown Sorting Order in Panel */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <ArrowUpDown size={10} /> Urutkan Berdasarkan Waktu Chat
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="desc">Chat Terbaru Dahulu (Descending)</option>
                <option value="asc">Chat Terlama Dahulu (Ascending)</option>
              </select>
            </div>

            {/* Filter Course */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <BookOpen size={10} /> Mata Kuliah
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              >
                <option value="ALL">Semua Mata Kuliah</option>
                {uniqueCourses.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tanggal Akun User Dibuat */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <UserCheck size={10} className="text-pink-600" /> Tanggal Akun Dibuat (User)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={userCreatedStart}
                  onChange={(e) => setUserCreatedStart(e.target.value)}
                  className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                />
                <span className="text-[10px] text-slate-400">s/d</span>
                <input
                  type="date"
                  value={userCreatedEnd}
                  onChange={(e) => setUserCreatedEnd(e.target.value)}
                  className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
            </div>

            {/* Filter Waktu Pesan Terakhir */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Calendar size={10} /> Waktu Pesan Terakhir
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={lastMsgStart}
                  onChange={(e) => setLastMsgStart(e.target.value)}
                  className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                />
                <span className="text-[10px] text-slate-400">s/d</span>
                <input
                  type="date"
                  value={lastMsgEnd}
                  onChange={(e) => setLastMsgEnd(e.target.value)}
                  className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* DAFTAR SESI CHAT TERURUT */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loadingList ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              Loading sessions...
            </p>
          ) : filteredAndSortedSessions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-100 rounded-xl">
              Tidak ada sesi chat yang cocok dengan kriteria filter.
            </div>
          ) : (
            filteredAndSortedSessions.map((sess) => {
              const userCreatedStr = sess.user?.created_at
                ? new Date(sess.user.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={sess.conversation_id}
                  onClick={() => handleSelectSession(sess)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSession?.conversation_id === sess.conversation_id
                      ? "bg-indigo-50/70 border-indigo-200 shadow-sm"
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                      {sess.user?.full_name || "Student"}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {new Date(sess.last_message_at).toLocaleDateString([], {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      @{sess.user?.username}
                    </span>
                    {userCreatedStr && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-md">
                        Join: {userCreatedStr}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-medium">
                    <span className="truncate max-w-[130px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
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
              );
            })
          )}
        </div>
      </div>

      {/* KANAN: BUBBLE INTERAKSI CHAT REAL */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl flex flex-col p-6 overflow-hidden">
        {selectedSession ? (
          <>
            <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {selectedSession.user?.full_name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Topik: {selectedSession.title || "Diskusi Bebas"}
                </p>
              </div>
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-medium">
                {selectedSession.course?.fullname || "General Course"}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {loadingChat ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  Belum ada pesan di sesi ini.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`flex flex-col max-w-[75%] ${
                      msg.role === "user"
                        ? "ml-auto items-end"
                        : "mr-auto items-start"
                    }`}
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
              Pilih sesi chat mahasiswa dari daftar sebelah kiri untuk melihat percakapan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}