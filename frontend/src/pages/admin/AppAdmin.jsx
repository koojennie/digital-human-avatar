import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Terminal,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import SidebarItem from "../../components/Admin/SidebarItem";
import DashboardView from "./DashboardView";
import DocumentsView from "./DocumentView";
import UploadView from "./UploadView";
import RAGPlayground from "./RAGPlayground";
import { useEffect } from "react";
import React from "react";
import { DocumentServices } from "../../services/document.services";
import { authServices } from "../../services/auth.services";

// const mockApi = {
//   getDocuments: () => [
//     {
//       id: "1",
//       title: "Panduan_Informatika_2024.pdf",
//       category: "Kurikulum",
//       chunks: 145,
//       status: "indexed",
//       date: "2023-10-12",
//     },
//     {
//       id: "2",
//       title: "Algoritma_Dasar.docx",
//       category: "Materi",
//       chunks: 82,
//       status: "indexed",
//       date: "2023-10-15",
//     },
//     {
//       id: "3",
//       title: "Database_Systems_Final.pdf",
//       category: "Ujian",
//       chunks: 210,
//       status: "processing",
//       date: "2023-10-20",
//     },
//     {
//       id: "4",
//       title: "Etika_Profesi.pdf",
//       category: "Umum",
//       chunks: 0,
//       status: "failed",
//       date: "2023-10-21",
//     },
//     {
//       id: "5",
//       title: "Web_Development_Syllabus.pdf",
//       category: "Kurikulum",
//       chunks: 45,
//       status: "indexed",
//       date: "2023-10-22",
//     },
//   ],
//   uploadDocument: (file, metadata) =>
//     new Promise((resolve) =>
//       setTimeout(() => resolve({ success: true }), 2000),
//     ),
//   testRag: (query) =>
//     new Promise((resolve) =>
//       setTimeout(
//         () =>
//           resolve({
//             answer:
//               "RAG (Retrieval-Augmented Generation) adalah teknik untuk meningkatkan output LLM dengan mengambil data relevan dari basis pengetahuan eksternal.",
//             sources: [
//               {
//                 id: 1,
//                 title: "Definisi_AI.pdf",
//                 chunk:
//                   "RAG menggabungkan kemampuan generatif dengan pengambilan dokumen...",
//                 score: 0.94,
//                 metadata: "Halaman 12",
//               },
//               {
//                 id: 2,
//                 title: "Modul_LMS.docx",
//                 chunk:
//                   "Dalam konteks LMS, RAG memungkinkan tutor AI menjawab berdasarkan silabus...",
//                 score: 0.88,
//                 metadata: "Bab 2",
//               },
//             ],
//           }),
//         1500,
//       ),
//     ),
// };

export default function AppAdmin() {
  const documentServices = new DocumentServices();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [documents, setDocuments] = useState();
  const [numberDocument, setNumberDocument] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await documentServices.getDocumentsLibrary(
        page,
        limit,
      );

      const { data, pagination } = response.data;

      console.log("data from getDocumentsLibrary", data);

      setDocuments(data || []);
      setNumberDocument(pagination.total);
    } catch (error) {
      showToast("Failed to load documents from server.");
      console.error("Error fetching documents:", error);
    }
  };
  useEffect(() => {
  }, [page, limit]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari Dashboard Admin?")) {
      authServices.logOut(); // Menghapus token & redirect ke /login
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-8 z-[100] animate-in slide-in-from-right-10">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span className="text-sm font-bold">{notification}</span>
          </div>
        </div>
      )}

      {/* Overlay untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col p-6 z-[60] transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-10 pl-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-400 rounded-xl flex items-center justify-center">
              <Database className="text-white" size={22} />
            </div>
            <span className="text-xl font-extrabold tracking-tighter">
              Dashboard
            </span>
          </div>

          {/* Tombol Close untuk Mobile */}
          <button
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => {
              setActiveTab("dashboard");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarItem
            icon={FileText}
            label="Manage Documents"
            active={activeTab === "documents"}
            onClick={() => {
              setActiveTab("documents");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarItem
            icon={UploadCloud}
            label="Knowledge Ingestion"
            active={activeTab === "upload"}
            onClick={() => {
              setActiveTab("upload");
              setIsSidebarOpen(false);
            }}
          />
          <SidebarItem
            icon={Terminal}
            label="RAG Playground"
            active={activeTab === "playground"}
            onClick={() => {
              setActiveTab("playground");
              setIsSidebarOpen(false);
            }}
          />
        </nav>

        <div className="mt-auto space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-400 rounded-xl flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Admin</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                User
              </p>
            </div>
          </div>

          {/* Tombol Logout Baru yang Elegan */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-rose-600 bg-rose-50/50 hover:bg-rose-50 border border-rose-100/40 rounded-2xl text-sm font-extrabold transition-all duration-200 active:scale-[0.98] group"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:ml-72 flex flex-col h-screen overflow-y-auto">
        {/* Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-sm md:text-lg font-bold text-slate-800 truncate max-w-[150px] md:max-w-none">
              {activeTab === "dashboard" && "Overview"}
              {activeTab === "documents" && "All Documents"}
              {activeTab === "upload" && "Upload Knowledge Base"}
              {activeTab === "playground" && "RAG Sandbox"}
            </h2>
          </div>

          <div className="hidden sm:flex w-10 h-10 bg-pink-50 border border-indigo-100 rounded-xl items-center justify-center text-pink-600">
            <User size={20} />
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === "dashboard" && (
            <DashboardView docs={documents} totalDocuments={numberDocument} />
          )}
          {activeTab === "documents" && (
            <DocumentsView
              docs={documents}
              pagination={{ page, limit, total: numberDocument }}
            />
          )}
          {activeTab === "upload" && (
            <UploadView
              onUploadSuccess={() =>
                showToast("Documents processed successfully!")
              }
            />
          )}
          {activeTab === "playground" && <RAGPlayground />}
        </main>
      </div>
    </div>
  );
}
