import { useState } from "react";
import {
  Database,
  FileText,
  Search,
  Send,
  Terminal,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
  Layers,
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
      console.log('response playground FRONTEND ', response);
      
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
            <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
              <Terminal size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">RAG Playground</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Test Pipeline & Knowledge Retrieval</p>
            </div>
          </div>

          <form onSubmit={handleTestRAG} className="space-y-6">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tanyakan sesuatu pada basis pengetahuan AI..."
              className="w-full h-48 p-6 rounded-[2rem] border border-slate-200 bg-slate-50 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none text-sm font-medium leading-relaxed"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Synthesizing Answer...
                </>
              ) : (
                <>Run Retrieval Engine <Send size={18} /></>
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-segment synthesis</p>
              </div>
            </div>

            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {result.answersAI.map((item, index) => (
                <div
                  key={index}
                  className="group rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                      AI
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Assistant Response #{index + 1}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segmented output</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-slate-700 leading-relaxed text-sm font-medium whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-tight">
                      Face: {item.facialExpression}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 uppercase tracking-tight">
                      Anim: {item.animation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* --- RIGHT SECTION: Technical Analytics --- */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* RETRIEVAL STATS */}
        {result?.summary && (
          <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl border-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-lg tracking-tight">Retrieval Metrics</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Similarity Threshold</p>
                <h4 className="text-3xl font-black text-indigo-400">{result.summary.threshold}</h4>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Retrieved</p>
                  <h4 className="text-2xl font-black">{result.summary.totalRetrieved}</h4>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Relevant</p>
                  <h4 className="text-2xl font-black text-emerald-400">{result.summary.totalRelevant}</h4>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* RAW RETRIEVED CHUNKS */}
        <Card className="p-8 rounded-[2.5rem] bg-slate-950 text-white min-h-[500px] border border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <Search className="text-indigo-400" size={18} />
            <h3 className="font-bold text-lg tracking-tight">Source Chunks</h3>
          </div>

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center text-center py-24 opacity-30">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Layers size={36} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Waiting for Query</p>
            </div>
          )}

          {loading && (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="h-4 bg-white/10 rounded-full w-1/3 mb-4" />
                  <div className="h-3 bg-white/5 rounded-full w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded-full w-5/6" />
                </div>
              ))}
            </div>
          )}

          {result?.retrievedChunks && (
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {result.retrievedChunks.map((chunk) => (
                <div
                  key={chunk.chunkId}
                  className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all border-l-4 border-l-indigo-500"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                      Score: {chunk.similarityScore}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      Page {chunk.metadata?.page}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic mb-5 line-clamp-4">
                    "{chunk.content}"
                  </p>
                  <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <FileText size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-white truncate">
                        {chunk.metadata?.source}
                      </p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                        Chunk #{chunk.index}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* PROMPT CONTEXT VIEW */}
        {result?.context && (
          <Card className="p-6 rounded-[2rem] border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-emerald-500" size={18} />
              <h3 className="font-bold text-sm text-slate-800">Injected Context</h3>
            </div>
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
              <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                {result.context}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RAGPlayground;