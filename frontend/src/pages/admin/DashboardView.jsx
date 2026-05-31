import React, { useState } from "react";
import { Badge, Card, StatCard } from "../../components/Admin/Card";
import {
  CheckCircle2,
  Database,
  FileWarning,
  Layers,
  Trophy,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Static Data ────────────────────────────────────────────────────────────────
const LEADERBOARD = [
  { id: 1, full_name: "Andi Pratama",     username: "andi.p",   count: 87 },
  { id: 2, full_name: "Siti Rahma",       username: "siti.r",   count: 74 },
  { id: 3, full_name: "Budi Santoso",     username: "budi.s",   count: 68 },
  { id: 4, full_name: "Dewi Kusuma",      username: "dewi.k",   count: 55 },
  { id: 5, full_name: "Reza Firmansyah",  username: "reza.f",   count: 49 },
  { id: 6, full_name: "Lina Hartati",     username: "lina.h",   count: 41 },
  { id: 7, full_name: "Fajar Nugroho",    username: "fajar.n",  count: 33 },
];

const DAILY_DATA = [
  { label: "10 Mei", count: 38 },
  { label: "11 Mei", count: 42 },
  { label: "12 Mei", count: 35 },
  { label: "13 Mei", count: 55 },
  { label: "14 Mei", count: 61 },
  { label: "15 Mei", count: 47 },
  { label: "16 Mei", count: 70 },
  { label: "17 Mei", count: 83 },
  { label: "18 Mei", count: 65 },
  { label: "19 Mei", count: 58 },
  { label: "20 Mei", count: 74 },
  { label: "21 Mei", count: 69 },
  { label: "22 Mei", count: 78 },
  { label: "23 Mei", count: 91 },
];

const WEEKLY_DATA = [
  { label: "18 Feb", count: 180 },
  { label: "25 Feb", count: 210 },
  { label: "4 Mar",  count: 195 },
  { label: "11 Mar", count: 245 },
  { label: "18 Mar", count: 198 },
  { label: "25 Mar", count: 280 },
  { label: "1 Apr",  count: 265 },
  { label: "8 Apr",  count: 310 },
  { label: "15 Apr", count: 320 },
  { label: "22 Apr", count: 295 },
  { label: "29 Apr", count: 341 },
  { label: "6 Mei",  count: 378 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100",   text: "text-amber-700"  },
  { bg: "bg-rose-100",    text: "text-rose-700"   },
  { bg: "bg-sky-100",     text: "text-sky-700"    },
  { bg: "bg-violet-100",  text: "text-violet-700" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

function getInitials(name = "") {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-md text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-indigo-600">{payload[0].value} conversations</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const DashboardView = ({ docs, totalDocuments }) => {
  const [chartMode, setChartMode] = useState("day");
  const chartData = chartMode === "day" ? DAILY_DATA : WEEKLY_DATA;
  const maxCount = LEADERBOARD[0]?.count ?? 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Documents"
          value={totalDocuments !== undefined ? totalDocuments : docs.length}
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

      {/* Recent Activity Card */}
      <Card className="p-8">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Chart ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-indigo-500" />
                <span className="text-sm font-bold text-slate-700">Conversations</span>
              </div>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setChartMode("day")}
                  className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                    chartMode === "day"
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setChartMode("week")}
                  className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                    chartMode === "week"
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Mingguan
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  interval={chartMode === "day" ? 2 : 1}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Leaderboard ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-amber-500" />
              <span className="text-sm font-bold text-slate-700">Leaderboard User</span>
            </div>

            <div className="space-y-2">
              {LEADERBOARD.map((u, i) => {
                const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const pct = Math.round((u.count / maxCount) * 100);
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    {/* Rank */}
                    <div className="w-5 text-center text-sm flex-shrink-0">
                      {i < 3 ? (
                        <span>{MEDAL[i]}</span>
                      ) : (
                        <span className="font-bold text-slate-400 text-xs">{i + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ac.bg} ${ac.text}`}
                    >
                      {getInitials(u.full_name)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{u.full_name}</p>
                      <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                    </div>

                    {/* Bar */}
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                      <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Count */}
                    <span className="text-xs font-bold text-indigo-600 min-w-[24px] text-right flex-shrink-0">
                      {u.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
};

export default DashboardView;
