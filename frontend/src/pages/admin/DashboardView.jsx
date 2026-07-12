import React, { useState } from "react";
import { Badge, Card, StatCard } from "../../components/Admin/Card";
import {
  CheckCircle2,
  Database,
  Users,
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
import { useEffect } from "react";
import { dashboardServices } from "../../services/dashboard.services";

// ── Helpers ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-md text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-pink-600">
        {payload[0].value} conversations
      </p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const DashboardView = ({ docs, totalDocuments }) => {
  const [chartMode, setChartMode] = useState("day");
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dataDashboardLeaderboard =
          await dashboardServices.getDashboardOverview();
        setLeaderboard(dataDashboardLeaderboard.data.leaderboard);
        setDailyData(dataDashboardLeaderboard.data.dailyData);
        setWeeklyData(dataDashboardLeaderboard.data.weeklyData);
        setTotalUsers(dataDashboardLeaderboard.data.totalUsers);
        // console.log(dataDashboardLeaderboard.data.leaderboard);
      } catch (error) {
        console.error("🚨 [FETCH DASHBOARD ERROR] ->", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = chartMode === "day" ? dailyData :  weeklyData;
  const maxCount = leaderboard[0]?.count ?? 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Syncing Collexa database metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Documents"
          value={totalDocuments !== undefined ? totalDocuments : docs.length}
          icon={Database}
          colorClass="bg-pink-50 text-pink-600"
        />
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={Users}
          colorClass="bg-red-50 text-red-600"
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
      </div>

      {/* Recent Activity Card */}
      <Card className="p-8">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Chart ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-pink-400" />
                <span className="text-sm font-bold text-slate-700">
                  Conversations
                </span>
              </div>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setChartMode("week")}
                  className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                    chartMode === "week"
                      ? "bg-white text-pink-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setChartMode("day")}
                  className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                    chartMode === "day"
                      ? "bg-white text-pink-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Harian
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  // interval={chartMode === "day" ? 2 : 1}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(99,102,241,0.06)" }}
                />
                <Bar
                  dataKey="count"
                  fill="#db2777"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Leaderboard ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-pink-600" />
              <span className="text-sm font-bold text-slate-700">
                Leaderboard User
              </span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((u, i) => {
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
                        <span className="font-bold text-slate-400 text-xs">
                          {i + 1}
                        </span>
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
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        @{u.username}
                      </p>
                    </div>

                    {/* Bar */}
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block flex-shrink-0">
                      <div
                        className="h-full bg-pink-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Count */}
                    <span className="text-xs font-bold text-pink-600 min-w-[24px] text-right flex-shrink-0">
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
