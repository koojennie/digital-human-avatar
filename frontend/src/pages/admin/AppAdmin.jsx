import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Database,
  FileText,
  LayoutDashboard,
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

const mockApi = {
  getDocuments: () => [
    {
      id: "1",
      title: "Panduan_Informatika_2024.pdf",
      category: "Kurikulum",
      chunks: 145,
      status: "indexed",
      date: "2023-10-12",
    },
    {
      id: "2",
      title: "Algoritma_Dasar.docx",
      category: "Materi",
      chunks: 82,
      status: "indexed",
      date: "2023-10-15",
    },
    {
      id: "3",
      title: "Database_Systems_Final.pdf",
      category: "Ujian",
      chunks: 210,
      status: "processing",
      date: "2023-10-20",
    },
    {
      id: "4",
      title: "Etika_Profesi.pdf",
      category: "Umum",
      chunks: 0,
      status: "failed",
      date: "2023-10-21",
    },
    {
      id: "5",
      title: "Web_Development_Syllabus.pdf",
      category: "Kurikulum",
      chunks: 45,
      status: "indexed",
      date: "2023-10-22",
    },
  ],
  uploadDocument: (file, metadata) =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ success: true }), 2000),
    ),
  testRag: (query) =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            answer:
              "RAG (Retrieval-Augmented Generation) adalah teknik untuk meningkatkan output LLM dengan mengambil data relevan dari basis pengetahuan eksternal.",
            sources: [
              {
                id: 1,
                title: "Definisi_AI.pdf",
                chunk:
                  "RAG menggabungkan kemampuan generatif dengan pengambilan dokumen...",
                score: 0.94,
                metadata: "Halaman 12",
              },
              {
                id: 2,
                title: "Modul_LMS.docx",
                chunk:
                  "Dalam konteks LMS, RAG memungkinkan tutor AI menjawab berdasarkan silabus...",
                score: 0.88,
                metadata: "Bab 2",
              },
            ],
          }),
        1500,
      ),
    ),
};

export default function AppAdmin() {
  const documentServices = new DocumentServices();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [documents, setDocuments] = useState(mockApi.getDocuments());
  const [numberDocument, setNumberDocument] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await documentServices.getDocumentsLibrary(
          page,
          limit,
        );

        const { data, pagination } = response.data;

        // const formattedDocs = data.map((doc) => ({
        //   ...doc,
        //   date: doc.created_at
        //     ? new Date(doc.created_at).toISOString().split("T")[0]
        //     : "",
        // }));

        // setDocuments(formattedDocs);
        setNumberDocument(pagination.total);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    loadDocuments();
  }, []);

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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Database className="text-white" size={22} />
            </div>
            <span className="text-xl font-extrabold tracking-tighter">
              Admin<span className="text-indigo-600">RAG</span>
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

        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Admin Central</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Super Administrator
              </p>
            </div>
          </div>
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
              {activeTab === "dashboard" && "System Overview"}
              {activeTab === "documents" && "Document Library"}
              {activeTab === "upload" && "Upload Knowledge"}
              {activeTab === "playground" && "RAG Sandbox"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Nodes Online
              </span>
            </div>
            <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="hidden sm:flex w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl items-center justify-center text-indigo-600">
              <User size={20} />
            </div>
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
