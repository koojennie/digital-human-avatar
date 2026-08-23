import { useState } from "react";
import {
  Database,
  FileText,
  Search,
  Send,
  Terminal,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Activity,
} from "lucide-react";
import { Card } from "../../components/Admin/Card";
import ragServices from "../../services/rag.services";

const RAGPlayground = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestRAG = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const response = await ragServices.retrievePlayground(query);
      setResult(response.data);
    } catch (error) {
      console.error("RAG Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-in fade-in duration-700">
      
      {/* --- LEFT SECTION: Interaction & AI Output --- */}
      <div className="xl:col-span-3 space-y-8">
        
        {/* QUERY SANDBOX CARD */}
        <Card className="p-8 rounded-[2.5rem] bg-white shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 bg-pink-600 text-white rounded-2xl">
              <Terminal size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">RAG Playground</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Test Pipeline & Cosine Similarity</p>
            </div>
          </div>

          <form onSubmit={handleTestRAG} className="space-y-6">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik pertanyaan untuk menguji nilai similarity chunk materi...."
              className="w-full h-44 p-6 rounded-[2rem] border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all resize-none text-sm font-medium leading-relaxed"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 rounded-2xl bg-pink-600 text-white font-bold hover:bg-pink-700 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Menguji Vector Search & AI...
                </>
              ) : (
                <>Uji Similarity & Jawaban <Send size={18} /></>
              )}
            </button>
          </form>
        </Card>

        {/* AI SEGMENTED RESPONSE */}
        {result?.answersAI && (
          <Card className="p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">AI Intelligent Response</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avatar Output State</p>
              </div>
            </div>

            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {result.answersAI.map((item, index) => (
                <div
                  key={index}
                  className="group rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-100">
                      AI
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Pesan #{index + 1}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avatar Dialogue</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-slate-700 leading-relaxed text-sm font-medium whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase">
                      Face: {item.facialExpression}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 uppercase">
                      Anim: {item.animation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* --- RIGHT SECTION: Technical Analytics & Cosine Scores --- */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* RETRIEVAL STATS & MAX COSINE */}
        {result?.summary && (
          <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl border-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
                <Database size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-tight">Retrieval Metrics</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vector Search Analytics</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* 🎯 KARTU MAX COSINE SIMILARITY TERTINGGI */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Activity size={12} className="text-pink-400" /> Max Cosine Score
                  </p>
                  <h4 className={`text-3xl font-black ${
                    result.summary.maxCosineSimilarity >= result.summary.threshold ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {result.summary.maxCosineSimilarity}
                  </h4>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    result.summary.maxCosineSimilarity >= result.summary.threshold 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    {result.summary.maxCosineSimilarity >= result.summary.threshold ? "MATCH (RELEVAN)" : "LOW (DITOLAK)"}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Threshold: {result.summary.threshold}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Chunks Checked</p>
                  <h4 className="text-2xl font-black">{result.summary.totalRetrieved}</h4>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passed (&ge; 0.70)</p>
                  <h4 className="text-2xl font-black text-emerald-400">{result.summary.totalRelevant}</h4>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* RAW RETRIEVED CHUNKS DENGAN INDIKATOR WARNA SCORE */}
        <Card className="p-8 rounded-[2.5rem] bg-slate-950 text-white min-h-[460px] border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Search className="text-pink-400" size={18} />
              <h3 className="font-bold text-base tracking-tight text-slate-200">Source Chunks Breakdown</h3>
            </div>
            {result?.retrievedChunks && (
              <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg">
                Top {result.retrievedChunks.length} Chunks
              </span>
            )}
          </div>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center text-center py-24 opacity-30">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Layers size={28} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Waiting for Query</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                  <div className="h-4 bg-white/10 rounded-full w-1/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded-full w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded-full w-4/5" />
                </div>
              ))}
            </div>
          )}

          {result?.retrievedChunks && (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {result.retrievedChunks.map((chunk) => {
                const isPassed = chunk.similarityScore >= (result.summary?.threshold || 0.7);

                return (
                  <div
                    key={chunk.chunkId || chunk.index}
                    className={`p-5 bg-white/5 border rounded-2xl transition-all ${
                      isPassed
                        ? "border-emerald-500/50 border-l-4 border-l-emerald-500 hover:bg-emerald-950/20"
                        : "border-slate-800 border-l-4 border-l-rose-500/60 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          isPassed
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        }`}>
                          Cosine: {chunk.similarityScore}
                        </span>
                        {isPassed ? (
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Relevan
                          </span>
                        ) : (
                          <span className="text-[9px] text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle size={11} /> Di Bawah Threshold
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        Hal. {chunk.metadata?.page || 1}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic mb-4 line-clamp-3">
                      "{chunk.content}"
                    </p>

                    <div className="pt-3 border-t border-white/5 flex items-center gap-2.5">
                      <FileText size={13} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-300 truncate flex-1">
                        {chunk.metadata?.source || "Document PDF"}
                      </p>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        Chunk #{chunk.index}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};

export default RAGPlayground;