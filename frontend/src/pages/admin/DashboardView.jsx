import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, StatCard } from "../../components/Admin/Card";
import {
  CheckCircle2,
  Database,
  Users,
  Layers,
  Trophy,
  TrendingUp,
  Filter,
  RotateCcw,
  Plus,
  Trash2,
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
import { dashboardServices } from "../../services/dashboard.services";

// ==================== CONFIG DYNAMIC FILTER ====================
const FILTER_FIELDS = [
  { id: "full_name", label: "Nama Mahasiswa", type: "string" },
  { id: "username", label: "Username", type: "string" },
  { id: "count", label: "Jumlah Chat", type: "number" },
  { id: "created_at", label: "Tanggal Akun Dibuat", type: "date" },
];

const OPERATORS_BY_TYPE = {
  string: [
    { id: "contains", label: "Contains" },
    { id: "equals", label: "Equals" },
  ],
  number: [
    { id: "equals", label: "Equals (=)" },
    { id: "gt", label: "Greater Than (>)" },
    { id: "gte", label: "Greater Than or Equal (>=)" },
    { id: "lt", label: "Less Than (<)" },
    { id: "lte", label: "Less Than or Equal (<=)" },
  ],
  date: [
    { id: "equals", label: "On Date (=)" },
    { id: "gt", label: "After (>)" },
    { id: "lt", label: "Before (<)" },
    { id: "between", label: "Between (Rentang)" },
  ],
};

const evaluateFilter = (itemValue, operator, filterValue, filterValue2, fieldType) => {
  if (itemValue === undefined || itemValue === null || itemValue === "") return false;

  if (fieldType === "date") {
    const itemDate = new Date(itemValue).setHours(0, 0, 0, 0);
    const valDate = new Date(filterValue).setHours(0, 0, 0, 0);
    if (isNaN(itemDate) || isNaN(valDate)) return true;

    switch (operator) {
      case "equals": return itemDate === valDate;
      case "gt": return itemDate > valDate;
      case "lt": return itemDate < valDate;
      case "between": {
        if (!filterValue2) return true;
        const valDate2 = new Date(filterValue2).setHours(0, 0, 0, 0);
        return itemDate >= valDate && itemDate <= valDate2;
      }
      default: return true;
    }
  }

  if (fieldType === "number") {
    const numItem = parseFloat(itemValue);
    const numVal = parseFloat(filterValue);
    if (isNaN(numVal)) return true;

    switch (operator) {
      case "equals": return numItem === numVal;
      case "gt": return numItem > numVal;
      case "gte": return numItem >= numVal;
      case "lt": return numItem < numVal;
      case "lte": return numItem <= numVal;
      default: return true;
    }
  }

  if (fieldType === "string") {
    const strItem = String(itemValue).toLowerCase();
    const strVal = String(filterValue).toLowerCase();
    switch (operator) {
      case "contains": return strItem.includes(strVal);
      case "equals": return strItem === strVal;
      default: return true;
    }
  }
  return true;
};

// ==================== UTILS ====================
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
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-md text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-bold text-pink-600">{payload[0].value} conversations</p>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const DashboardView = ({ docs = [], totalDocuments }) => {
  const [chartMode, setChartMode] = useState("week");

  // Data Mentah dari Backend
  const [rawLeaderboard, setRawLeaderboard] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // State Filter Dinamis
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Fetch Data Overall
  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await dashboardServices.getDashboardOverview();
      setRawLeaderboard(res?.data?.leaderboard ?? []);
      setDailyData(res?.data?.dailyData ?? []);
      setWeeklyData(res?.data?.weeklyData ?? []);
      setTotalUsers(res?.data?.totalUsers ?? 0);
    } catch (error) {
      console.error("🚨 [FETCH DASHBOARD ERROR] ->", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 🎯 Filter Data Leaderboard secara Dinamis
  const filteredLeaderboard = useMemo(() => {
    return rawLeaderboard.filter((user) => {
      return activeFilters.every((f) => {
        if (!f.value) return true;
        const fieldConfig = FILTER_FIELDS.find((cfg) => cfg.id === f.field);
        return evaluateFilter(user[f.field], f.operator, f.value, f.value2, fieldConfig.type);
      });
    });
  }, [rawLeaderboard, activeFilters]);

  // Handlers Filter
  const handleAddFilter = () => {
    setActiveFilters([
      ...activeFilters,
      {
        id: Date.now(),
        field: FILTER_FIELDS[0].id,
        operator: OPERATORS_BY_TYPE[FILTER_FIELDS[0].type][0].id,
        value: "",
        value2: "",
      },
    ]);
  };

  const handleRemoveFilter = (id) => setActiveFilters(activeFilters.filter((f) => f.id !== id));
  const handleResetFilter = () => setActiveFilters([]);

  const handleFilterChange = (id, key, val) => {
    setActiveFilters(activeFilters.map((f) => {
      if (f.id !== id) return f;
      if (key === "field") {
        const targetField = FILTER_FIELDS.find((cfg) => cfg.id === val);
        return { ...f, field: val, operator: OPERATORS_BY_TYPE[targetField.type][0].id, value: "", value2: "" };
      }
      return { ...f, [key]: val };
    }));
  };

  const chartData = chartMode === "day" ? dailyData : weeklyData;
  const maxCount = filteredLeaderboard[0]?.count ?? 1;
  const isFilterActive = activeFilters.length > 0;

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
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Documents" value={totalDocuments !== undefined ? totalDocuments : docs.length} icon={Database} colorClass="bg-pink-50 text-pink-600" />
        <StatCard label="Total Users" value={totalUsers} icon={Users} colorClass="bg-red-50 text-red-600" />
        <StatCard label="Total Chunks" value="1,420" icon={Layers} colorClass="bg-emerald-50 text-emerald-600" />
        <StatCard label="Indexed" value={docs.filter((d) => d.status === "indexed").length} icon={CheckCircle2} colorClass="bg-blue-50 text-blue-600" />
      </div>

      {/* ── Main Container Card ── */}
      <Card className="p-8">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KIRI: CHART */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-pink-400" />
                <span className="text-sm font-bold text-slate-700">Conversations</span>
              </div>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => setChartMode("week")} className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${chartMode === "week" ? "bg-white text-pink-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}>Mingguan</button>
                <button onClick={() => setChartMode("day")} className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${chartMode === "day" ? "bg-white text-pink-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}>Harian</button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                <Bar dataKey="count" fill="#db2777" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* KANAN: LEADERBOARD & DYNAMIC FILTER */}
          <div className="flex flex-col h-full">
            {/* Header Leaderboard */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-pink-600" />
                <span className="text-sm font-bold text-slate-700">Leaderboard User</span>
              </div>

              {/* 🎯 LOGO TOMBOL FILTER */}
              <div className="flex items-center gap-2">
                {isFilterActive && (
                  <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {`${activeFilters.length} Filter`}
                  </span>
                )}
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${showFilterPanel || isFilterActive
                      ? "bg-pink-50 border-pink-300 text-pink-600"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  <Filter size={13} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* 🎯 PANEL DYNAMIC FILTER (EXPANDABLE) */}
            {showFilterPanel && (
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Dynamic List View</span>
                  {isFilterActive && (
                    <button onClick={handleResetFilter} className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-pink-600 font-semibold">
                      <RotateCcw size={10} /> Reset
                    </button>
                  )}
                </div>

                {activeFilters.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Belum ada filter aktif.</p>
                ) : (
                  <div className="space-y-2">
                    {activeFilters.map((filter) => {
                      const currentFieldObj = FILTER_FIELDS.find((f) => f.id === filter.field);
                      const availableOps = OPERATORS_BY_TYPE[currentFieldObj.type];

                      return (
                        <div key={filter.id} className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                          <select
                            value={filter.field}
                            onChange={(e) => handleFilterChange(filter.id, "field", e.target.value)}
                            className="text-[11px] py-1 px-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
                          >
                            {FILTER_FIELDS.map((f) => (
                              <option key={f.id} value={f.id}>{f.label}</option>
                            ))}
                          </select>

                          <select
                            value={filter.operator}
                            onChange={(e) => handleFilterChange(filter.id, "operator", e.target.value)}
                            className="text-[11px] py-1 px-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
                          >
                            {availableOps.map((op) => (
                              <option key={op.id} value={op.id}>{op.label}</option>
                            ))}
                          </select>

                          <input
                            type={currentFieldObj.type === "date" ? "date" : currentFieldObj.type === "number" ? "number" : "text"}
                            value={filter.value}
                            placeholder="Nilai..."
                            onChange={(e) => handleFilterChange(filter.id, "value", e.target.value)}
                            className="flex-1 min-w-[80px] text-[11px] py-1 px-2 border border-slate-200 rounded-md focus:outline-none"
                          />

                          {currentFieldObj.type === "date" && filter.operator === "between" && (
                            <>
                              <span className="text-[10px] text-slate-400">s/d</span>
                              <input
                                type="date"
                                value={filter.value2}
                                onChange={(e) => handleFilterChange(filter.id, "value2", e.target.value)}
                                className="flex-1 min-w-[80px] text-[11px] py-1 px-2 border border-slate-200 rounded-md focus:outline-none"
                              />
                            </>
                          )}

                          <button onClick={() => handleRemoveFilter(filter.id)} className="text-slate-400 hover:text-red-500">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button onClick={handleAddFilter} className="flex items-center gap-1 text-[11px] font-bold text-pink-600 bg-pink-100/50 hover:bg-pink-100 px-2 py-1.5 rounded-lg transition">
                  <Plus size={12} /> Tambah Filter
                </button>
              </div>
            )}

            {/* List Leaderboard (Dengan Scrollbar) */}
            {filteredLeaderboard.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-12 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-100 rounded-xl">
                Tidak ada user yang sesuai kriteria filter.
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[340px] pr-2 custom-scrollbar">
                {filteredLeaderboard.map((u, i) => {
                  const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const pct = Math.round((u.count / maxCount) * 100);
                  const createdDateStr = u.created_at
                    ? new Date(u.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : null;

                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      {/* Rank */}
                      <div className="w-5 text-center text-sm flex-shrink-0">
                        {i < 3 ? <span>{MEDAL[i]}</span> : <span className="font-bold text-slate-400 text-xs">{i + 1}</span>}
                      </div>

                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ac.bg} ${ac.text}`}>
                        {getInitials(u.full_name)}
                      </div>

                      {/* Name & Created At */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{u.full_name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 truncate">@{u.username}</span>
                          {createdDateStr && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md truncate">
                              Join: {createdDateStr}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (Hidden di Mobile) */}
                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden md:block flex-shrink-0">
                        <div className="h-full bg-pink-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>

                      {/* Count Chat */}
                      <span className="text-xs font-bold text-pink-600 min-w-[24px] text-right flex-shrink-0">{u.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardView;