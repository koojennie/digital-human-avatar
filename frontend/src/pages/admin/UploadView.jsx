import { FileIcon, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Card } from "../../components/Admin/Card";
import { uploadDocument } from "../../hooks/useUploadDocuments";

const UploadView = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState("general");

  const {
    upload,
    loadingUploadDocument,
    errorUploadDocument,
    successUploadDocument,
  } = uploadDocument();

  const validateFile = (file) => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    if (file.type !== "application/pdf") {
      return "Hanya file PDF yang diperbolehkan";
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return "Format file harus .pdf";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 10MB";
    }

    return null;
  };


  const processFiles = (selectedFiles) => {
    const validFiles = [];

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);

      if (!error) {
        validFiles.push({
          file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "waiting",
        });
      }
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  /*
   |--------------------------------------------------------------------------
   | DRAG DROP
   |--------------------------------------------------------------------------
   */

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFiles = e.dataTransfer.files;

    processFiles(droppedFiles);
  };

  const handleFiles = (e) => {
    processFiles(e.target.files);
  };

 const startUpload = async () => {
  const updatedFiles = [...files];
  let standardSuccess = true; // Indikator pembantu untuk validasi akhir

  for (let i = 0; i < updatedFiles.length; i++) {
    // Abaikan jika file sudah sukses atau gagal sebelumnya
    if (updatedFiles[i].status === "success") continue;

    try {
      updatedFiles[i].status = "uploading";
      updatedFiles[i].progress = 30;
      setFiles([...updatedFiles]);

      // Eksekusi upload ke RAG Pipeline backend
      const result = await upload(updatedFiles[i].file, {
        category,
      });

    
      if (!result || result.success === false) {
        throw new Error("Backend pipeline failed");
      }

      updatedFiles[i].progress = 100;
      updatedFiles[i].status = "success";
      updatedFiles[i].result = result;
      setFiles([...updatedFiles]);

    } catch (error) {
      console.error(`Error uploading file ${updatedFiles[i].name}:`, error);
      
      
      updatedFiles[i].status = "error";
      updatedFiles[i].progress = 0;
      standardSuccess = false; 
      
      setFiles([...updatedFiles]);
    }
  }

  if (standardSuccess) {
    onUploadSuccess?.();
  } else {
    console.warn("Beberapa dokumen gagal di-index ke RAG Pipeline.");
  }
};

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      <Card className="p-10">
        <h3 className="text-xl font-extrabold mb-2">
          Ingestion Center
        </h3>

        <p className="text-slate-500 text-sm mb-8">
          Upload documents to the RAG pipeline.
          AI will automatically chunk and index them.
        </p>

        {/* CATEGORY */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Category Tag
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="kurikulum">
                Kurikulum
              </option>

              <option value="materi-kuliah">
                Materi Kuliah
              </option>

              <option value="ujian">
                Ujian
              </option>

              <option value="general">
                Umum
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Metadata Scope
            </label>

            <input
              type="text"
              placeholder="e.g. Semester Ganjil 2024"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* DROPZONE */}

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center hover:border-pink-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-pink-50 text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud size={32} />
          </div>

          <h4 className="text-lg font-bold">
            Drag & Drop files or click to browse
          </h4>

          <p className="text-slate-400 text-sm mt-1">
            Supports PDF only (Max 10MB)
          </p>

          <input
            type="file"
            id="fileInput"
            className="hidden"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFiles}
          />

          <button
            type="button"
            onClick={() =>
              document.getElementById("fileInput").click()
            }
            className="mt-6 px-8 py-3 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition-all ease-in duration-200 cursor-pointer"
          >
            Select Files
          </button>
        </div>

        {/* FILE LIST */}

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
                    <FileIcon
                      size={18}
                      className="text-indigo-600"
                    />

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
                    style={{
                      width: `${file.progress}%`,
                    }}
                  />
                </div>

                <div className="mt-2 text-xs">
                  {file.status === "success" && (
                    <span className="text-emerald-600 font-bold">
                      Indexed Successfully
                    </span>
                  )}

                  {file.status === "uploading" && (
                    <span className="text-indigo-600 font-bold">
                      Uploading...
                    </span>
                  )}

                  {file.status === "error" && (
                    <span className="text-rose-600 font-bold">
                      Failed
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* ERROR */}

            {errorUploadDocument && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-sm font-bold animate-in fade-in">
                {errorUploadDocument}
              </div>
            )}

            {/* SUCCESS */}

            {successUploadDocument && (
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-sm font-bold animate-in fade-in">
                {successUploadDocument}
              </div>
            )}

            {/* BUTTON */}

            <button
              onClick={startUpload}
              disabled={loadingUploadDocument}
              className="w-full py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 cursor-pointer transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loadingUploadDocument
                ? "Indexing Knowledge Base..."
                : "Start Indexing"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadView;