import { Database, FileText, Search, Send, Terminal } from "lucide-react";
import { Card } from "../../components/Admin/Card";
import { useState } from "react";

const RAGPlayground = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const data = await mockApi.testRag(query);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in duration-700">
      {/* Test Panel */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Terminal size={20} />
            </div>
            <h3 className="text-lg font-bold">Query Sandbox</h3>
          </div>
          <form onSubmit={handleTest} className="space-y-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question to test the RAG engine..."
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Retrieving Chunks...
                </div>
              ) : (
                <>
                  Run Retrieval <Send size={18} />
                </>
              )}
            </button>
          </form>
        </Card>

        {result && (
          <Card className="p-8 border-l-4 border-l-indigo-600 animate-in slide-in-from-left-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              AI Response
            </h4>
            <p className="text-slate-800 leading-relaxed font-medium">
              {result.answer}
            </p>
          </Card>
        )}
      </div>

      {/* Results / Metadata Panel */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-8 bg-slate-900 text-white h-full min-h-[500px]">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Search size={20} className="text-indigo-400" />
            Top Retrieved Chunks
          </h3>

          {!result && !loading && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 text-white/30">
                <Database size={32} />
              </div>
              <p className="text-slate-400 text-sm">
                Run a query to see vector similarity results.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-white/5 rounded-2xl border border-white/10 animate-pulse"
                >
                  <div className="h-4 bg-white/10 rounded-full w-3/4 mb-3" />
                  <div className="h-3 bg-white/5 rounded-full w-full mb-2" />
                  <div className="h-3 bg-white/5 rounded-full w-5/6" />
                </div>
              ))}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.sources.map((source) => (
                <div
                  key={source.id}
                  className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-default"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">
                      Similarity: {source.score}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {source.metadata}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed mb-3">
                    "{source.chunk}"
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <FileTex size={14} className="text-indigo-400" />
                    {source.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RAGPlayground;
