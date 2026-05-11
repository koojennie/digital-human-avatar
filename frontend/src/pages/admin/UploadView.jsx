import { FileIcon, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Card } from "../../components/Admin/Card";

const UploadView = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState("Umum");

  const handleDrop = (e) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: f.size,
      progress: 0,
    }));
    setFiles([...files, ...newFiles]);
  };

  const startUpload = async () => {
    setIsUploading(true);
    // Simulate multi-file upload progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          progress: Math.min(f.progress + Math.random() * 20, 100),
        })),
      );
    }, 500);

    await mockApi.uploadDocument();
    clearInterval(interval);
    setIsUploading(false);
    onUploadSuccess();
    setFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      <Card className="p-10">
        <h3 className="text-xl font-extrabold mb-2">Ingestion Center</h3>
        <p className="text-slate-500 text-sm mb-8">
          Upload documents to the RAG pipeline. AI will automatically chunk and
          index them.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Category Tag
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Kurikulum</option>
              <option>Materi Kuliah</option>
              <option>Ujian</option>
              <option>Umum</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Metadata Scope
            </label>
            <input
              type="text"
              placeholder="e.g. Semester Ganjil 2024"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud size={32} />
          </div>
          <h4 className="text-lg font-bold">
            Drag & Drop files or click to browse
          </h4>
          <p className="text-slate-400 text-sm mt-1">
            Supports PDF, DOCX, TXT (Max 10MB per file)
          </p>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            onClick={() => document.getElementById("fileInput").click()}
            className="mt-6 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            Select Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-8 space-y-4">
            <h5 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Queue ({files.length})
            </h5>
            {files.map((file, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <FileIcon size={18} className="text-indigo-600" />
                    <span className="text-sm font-bold truncate max-w-xs">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-indigo-600 font-bold">
                    {Math.floor(file.progress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <button
              onClick={startUpload}
              disabled={isUploading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {isUploading ? "Indexing Knowledge Base..." : "Start Indexing"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadView;
