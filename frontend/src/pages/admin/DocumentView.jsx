import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, FileText, Search, Trash2 } from "lucide-react";

import { Badge, Card } from "../../components/Admin/Card";

const DocumentsView = ({ docs }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Card className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-80 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50">
            Filter
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Chunks</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <span className="font-semibold text-sm">{doc.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {doc.category}
                </td>
                <td className="px-6 py-4 text-sm font-mono">{doc.chunks}</td>
                <td className="px-6 py-4">
                  <Badge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {docs.length} documents
        </p>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            disabled
          >
            <ChevronLeft size={16} />
          </button>
          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DocumentsView;