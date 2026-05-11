import React from "react";
import { Badge, Card, StatCard } from "../../components/Admin/Card";
import { CheckCircle2, Database, FileText, FileWarning, Layers } from "lucide-react";

const DashboardView = ({ docs }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Total Documents"
        value={docs.length}
        icon={Database}
        colorClass="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        label="Total Chunks"
        value="1,420"
        icon={Layers}
        colorClass="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        label="Indexed"
        value={docs.filter((d) => d.status === "indexed").length}
        icon={CheckCircle2}
        colorClass="bg-blue-50 text-blue-600"
      />
      <StatCard
        label="Failed"
        value={docs.filter((d) => d.status === "failed").length}
        icon={FileWarning}
        colorClass="bg-rose-50 text-rose-600"
      />
    </div>

    <Card className="p-8">
      <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {docs.slice(0, 3).map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <FileText size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-sm">{doc.title}</p>
                <p className="text-xs text-slate-500">
                  {doc.date} • {doc.category}
                </p>
              </div>
            </div>
            <Badge status={doc.status} />
          </div>
        ))}
      </div>
    </Card>
  </div>
);
export default DashboardView;
