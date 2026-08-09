import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  GraduationCap,
  RefreshCw,
  AlertCircle,
  Filter,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Card } from "../../components/Admin/Card";
import { engagementServices } from "../../services/engagement.services";

// ==================== CONFIG FIELD FILTER DINAMIS ====================
const FILTER_FIELDS = [
  { id: "nama", label: "Nama Mahasiswa", type: "string" },
  { id: "engagementScore", label: "Engagement Score", type: "number" },
  { id: "totalKlik", label: "Total Klik Materi", type: "number" },
  { id: "totalPertanyaan", label: "Total Pertanyaan", type: "number" },
  { id: "avgCosineSimilarity", label: "Avg Cosine Similarity", type: "number" },
  {
    id: "kategori",
    label: "Kategori Score",
    type: "select",
    options: ["> 0.70", "0.40 - 0.70", "< 0.40"],
  },
  { id: "user_created_at", label: "Tanggal Akun Dibuat (User Created)", type: "date" },
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
  select: [{ id: "equals", label: "Equals" }],
  date: [
    { id: "equals", label: "On Date (=)" },
    { id: "gt", label: "After (>)" },
    { id: "lt", label: "Before (<)" },
    { id: "between", label: "Between (Rentang Tanggal)" },
  ],
};

// Evaluator Evaluasi Aturan Filter
const evaluateFilter = (itemValue, operator, filterValue, filterValue2, fieldType) => {
  if (itemValue === undefined || itemValue === null || itemValue === "") return false;

  // Handling Tipe Tanggal
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

  // Handling Tipe Angka
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

  // Handling Tipe String
  if (fieldType === "string") {
    const strItem = String(itemValue).toLowerCase();
    const strVal = String(filterValue).toLowerCase();
    switch (operator) {
      case "contains": return strItem.includes(strVal);
      case "equals": return strItem === strVal;
      default: return true;
    }
  }

  // Handling Tipe Select Options
  if (fieldType === "select") {
    return String(itemValue) === String(filterValue);
  }

  return true;
};

// ==================== KOMPONEN DYNAMIC FILTER BAR ====================
const DynamicFilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState([]);

  const handleAddFilter = () => {
    const newFilter = {
      id: Date.now(),
      field: FILTER_FIELDS[0].id,
      operator: OPERATORS_BY_TYPE[FILTER_FIELDS[0].type][0].id,
      value: "",
      value2: "",
    };
    const updated = [...filters, newFilter];
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleRemoveFilter = (id) => {
    const updated = filters.filter((f) => f.id !== id);
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleFieldChange = (id, fieldId) => {
    const targetField = FILTER_FIELDS.find((f) => f.id === fieldId);
    const defaultOperator = OPERATORS_BY_TYPE[targetField.type][0].id;
    const updated = filters.map((f) =>
      f.id === id
        ? { ...f, field: fieldId, operator: defaultOperator, value: "", value2: "" }
        : f
    );
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleValueChange = (id, key, val) => {
    const updated = filters.map((f) => (f.id === id ? { ...f, [key]: val } : f));
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    setFilters([]);
    onFilterChange([]);
  };

  return (
    <Card className="p-6 bg-white shadow-sm rounded-2xl border border-slate-100 mb-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-pink-600" />
          <h4 className="font-bold text-slate-800 text-sm">
            Dynamic List View Filter
          </h4>
        </div>
        {filters.length > 0 && (
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-pink-600 flex items-center gap-1 font-semibold"
          >
            <RotateCcw size={12} /> Reset Filter
          </button>
        )}
      </div>

      {filters.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          Belum ada filter aktif. Klik "Tambah Filter" untuk menyaring berdasarkan nama, score, atau tanggal pembuatan akun.
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {filters.map((filter) => {
            const currentFieldObj = FILTER_FIELDS.find((f) => f.id === filter.field);
            const availableOperators = OPERATORS_BY_TYPE[currentFieldObj.type];

            return (
              <div
                key={filter.id}
                className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200"
              >
                {/* 1. Select Field */}
                <select
                  value={filter.field}
                  onChange={(e) => handleFieldChange(filter.id, e.target.value)}
                  className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-pink-500/20"
                >
                  {FILTER_FIELDS.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.label}
                    </option>
                  ))}
                </select>

                {/* 2. Select Operator */}
                <select
                  value={filter.operator}
                  onChange={(e) => handleValueChange(filter.id, "operator", e.target.value)}
                  className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-pink-500/20"
                >
                  {availableOperators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.label}
                    </option>
                  ))}
                </select>

                {/* 3. Value Input */}
                {currentFieldObj.type === "select" ? (
                  <select
                    value={filter.value}
                    onChange={(e) => handleValueChange(filter.id, "value", e.target.value)}
                    className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {currentFieldObj.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      currentFieldObj.type === "date"
                        ? "date"
                        : currentFieldObj.type === "number"
                        ? "number"
                        : "text"
                    }
                    placeholder="Nilai acuan..."
                    value={filter.value}
                    onChange={(e) => handleValueChange(filter.id, "value", e.target.value)}
                    className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                )}

                {/* Date Range Second Input */}
                {currentFieldObj.type === "date" && filter.operator === "between" && (
                  <>
                    <span className="text-xs text-slate-400 font-medium">s/d</span>
                    <input
                      type="date"
                      value={filter.value2}
                      onChange={(e) => handleValueChange(filter.id, "value2", e.target.value)}
                      className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </>
                )}

                {/* Delete Filter Button */}
                <button
                  onClick={() => handleRemoveFilter(filter.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleAddFilter}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition"
      >
        <Plus size={14} /> Tambah Filter
      </button>
    </Card>
  );
};

// ==================== CONSTANTS & UTILS RECHARTS ====================
const THRESHOLD_RELEVANSI = 0.5;

const KATEGORI_COLORS = {
  "> 0.70": "#db2777",
  "0.40 - 0.70": "#f472b6",
  "< 0.40": "#fbcfe8",
};

const getKategoriColor = (kategori) => KATEGORI_COLORS[kategori] || "#db2777";

const RenderScoreLabel = ({ x, y, width, height, value }) => (
  <text x={x + width + 8} y={y + height / 2} dy={4} fontSize={12} fontWeight={600} fill="#334155">
    {typeof value === "number" ? value.toFixed(4) : value}
  </text>
);

const RenderQuizScoreLabel = ({ x, y, width, height, value }) => (
  <text x={x + width + 8} y={y + height / 2} dy={4} fontSize={12} fontWeight={600} fill="#334155">
    {typeof value === "number" ? value.toFixed(1) : value}
  </text>
);

const RenderScatterLabel = ({ x, y, value }) => (
  <text x={x} y={y - 12} fontSize={11} fontWeight={600} fill="#334155" textAnchor="middle">
    {value}
  </text>
);

const customTooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  fontSize: "12px",
};

// ==================== MAIN COMPONENT ====================
const EngagementScoreView = () => {
  const [rawReports, setRawReports] = useState([]);
  const [quizGrades, setQuizGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // State Filter Dinamis
  const [activeFilters, setActiveFilters] = useState([]);

  // Fetch Data Dashboard
  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      setError(null);
      if (isManualRefresh) {
        setIsRefreshing(true);
        await engagementServices.refreshEngagementBatch();
      } else {
        setLoading(true);
      }

      const [overviewRes, quizRes] = await Promise.all([
        engagementServices.getDashboardOverview(),
        engagementServices.getQuizGrades(1),
      ]);

      setRawReports(overviewRes?.data?.studentReports ?? []);
      setQuizGrades(quizRes?.data ?? []);
    } catch (err) {
      console.error("Gagal memuat student engagement reports:", err);
      setError(err.message || "Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // 1. Bar Chart Data: Score Engagement Per Mahasiswa (Filtered)
  const engagementScoreData = useMemo(() => {
    return rawReports
      .map((item) => {
        const score = parseFloat(item.engagement_score || 0);
        let rentangKategori = "0.40 - 0.70";
        if (score > 0.7) rentangKategori = "> 0.70";
        else if (score < 0.4) rentangKategori = "< 0.40";

        return {
          nama: item.nama_mahasiswa || "Mahasiswa",
          totalKlik: item.total_klik || 0,
          totalPertanyaan: item.total_pertanyaan || 0,
          avgCosineSimilarity: parseFloat(item.avg_cosine_similarity || 0),
          engagementScore: score,
          kategori: rentangKategori,
          // 🎯 Menagkap data tanggal pembuatan akun dari JOIN Sequelize (user.created_at)
          user_created_at: item.user_created_at || item.user?.created_at || item["user.created_at"],
        };
      })
      .filter((item) => {
        // Evaluasi aturan filter dinamis (Aturan AND)
        return activeFilters.every((f) => {
          if (!f.value) return true;
          const fieldConfig = FILTER_FIELDS.find((cfg) => cfg.id === f.field);
          return evaluateFilter(item[f.field], f.operator, f.value, f.value2, fieldConfig.type);
        });
      })
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }, [rawReports, activeFilters]);

  // 2. Scatter Plot Data
  const scatterData = useMemo(() => {
    return engagementScoreData.map((d) => ({
      nama: d.nama.split(" ")[0],
      totalKlik: d.totalKlik,
      avgCosineSimilarity: d.avgCosineSimilarity,
      kategori: d.kategori,
    }));
  }, [engagementScoreData]);

  // 3. Quiz Grade Data (Hanya tampilkan mahasiswa yang lolos filter)
  const quizGradeData = useMemo(() => {
    const filteredStudentNames = new Set(engagementScoreData.map((d) => d.nama));
    return quizGrades
      .map((item) => ({
        nama: item.fullname || "Mahasiswa",
        score: parseFloat(item.score || 0),
      }))
      .filter((item) => activeFilters.length === 0 || filteredStudentNames.has(item.nama))
      .sort((a, b) => b.score - a.score);
  }, [quizGrades, engagementScoreData, activeFilters]);

  // 4. Donut Chart Data: Distribusi Kategori
  const engagementDistributionData = useMemo(() => {
    const totalMahasiswa = engagementScoreData.length;
    const counts = engagementScoreData.reduce(
      (acc, curr) => {
        if (acc[curr.kategori] !== undefined) acc[curr.kategori]++;
        return acc;
      },
      { "> 0.70": 0, "0.40 - 0.70": 0, "< 0.40": 0 }
    );

    return Object.keys(counts).map((key) => {
      const value = counts[key];
      const percentage =
        totalMahasiswa > 0 ? parseFloat(((value / totalMahasiswa) * 100).toFixed(1)) : 0;
      return { name: key, value, percentage };
    });
  }, [engagementScoreData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">
          Memuat data statistik engagement mahasiswa...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Gagal Memuat Data</h3>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={() => loadData(false)}
          className="px-4 py-2 bg-pink-600 text-white font-medium rounded-xl text-sm hover:bg-pink-700 transition"
        >
          Coba Lagi
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── SECTION DYNAMIC LIST VIEW FILTER BAR ── */}
      <DynamicFilterBar onFilterChange={(filters) => setActiveFilters(filters)} />

      {/* ── BAR CHART: Engagement Score per Mahasiswa ── */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Engagement Score per Mahasiswa
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            Hasil Filter: {engagementScoreData.length} Mahasiswa
          </span>
        </div>

        {engagementScoreData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Tidak ada data mahasiswa yang sesuai dengan kriteria filter.
          </div>
        ) : (
          <div style={{ height: Math.max(engagementScoreData.length * 36 + 40, 200) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementScoreData}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
                barCategoryGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="nama"
                  width={160}
                  tick={{ fontSize: 12, fill: "#334155" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value, _name, props) => [
                    typeof value === "number" ? value.toFixed(4) : value,
                    `Rentang Skor: ${props.payload.kategori}`,
                  ]}
                  contentStyle={customTooltipStyle}
                />
                <Bar dataKey="engagementScore" radius={[0, 6, 6, 0]}>
                  <LabelList dataKey="engagementScore" content={<RenderScoreLabel />} />
                  {engagementScoreData.map((entry, index) => (
                    <Cell
                      key={`cell-bar-${index}`}
                      fill={getKategoriColor(entry.kategori)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── GRID: DONUT CHART & SCATTER PLOT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* DONUT CHART */}
        <Card className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <PieIcon size={18} className="text-pink-500" />
              <h3 className="text-lg font-bold text-slate-800">
                Distribusi Kategori Engagement
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementDistributionData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    labelLine={false}
                  >
                    {engagementDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-pie-${index}`}
                        fill={getKategoriColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} mahasiswa`, `Skor ${name}`]}
                    contentStyle={customTooltipStyle}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            <span
              className="font-bold"
              style={{ color: KATEGORI_COLORS["0.40 - 0.70"] }}
            >
              {engagementDistributionData.find((d) => d.name === "0.40 - 0.70")?.percentage || 0}%
            </span>{" "}
            mahasiswa terfilter berada pada rentang skor{" "}
            <span className="font-semibold">0.40 - 0.70</span>.
          </p>
        </Card>

        {/* SCATTER PLOT */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <ScatterIcon size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Klik Materi vs Relevansi Pertanyaan
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="totalKlik"
                  name="Total Klik Materi"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="avgCosineSimilarity"
                  name="Avg Cosine Similarity"
                  domain={[0.0, 1.0]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ZAxis range={[120, 120]} />
                <ReferenceLine
                  y={THRESHOLD_RELEVANSI}
                  stroke="#db2777"
                  strokeDasharray="4 4"
                  label={{
                    value: "Threshold relevansi",
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "#db2777",
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(3) : value,
                    name,
                  ]}
                  contentStyle={customTooltipStyle}
                />
                <Scatter data={scatterData}>
                  <LabelList dataKey="nama" content={<RenderScatterLabel />} />
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-scatter-${index}`}
                      fill={getKategoriColor(entry.kategori)}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── BAR CHART: Nilai Kuis ── */}
      <Card className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap size={18} className="text-pink-500" />
          <h3 className="text-lg font-bold text-slate-800">
            Nilai Kuis Pilihan Ganda per Mahasiswa
          </h3>
        </div>
        <div style={{ height: Math.max(quizGradeData.length * 36 + 40, 200) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={quizGradeData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="nama"
                width={160}
                tick={{ fontSize: 12, fill: "#334155" }}
                tickLine={false}
                axisLine={false}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="#db2777">
                <LabelList dataKey="score" content={<RenderQuizScoreLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── REFRESH BATCH BUTTON ── */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => loadData(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-white font-semibold text-sm shadow-md transition-all duration-200 ${
            isRefreshing
              ? "bg-pink-400 cursor-not-allowed opacity-80"
              : "bg-pink-600 hover:bg-pink-700 active:scale-95 hover:shadow-lg"
          }`}
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
          <span>
            {isRefreshing
              ? "Mengkalkulasi Ulang Data..."
              : "Hitung Ulang & Refresh Data"}
          </span>
        </button>
      </div>

    </div>
  );
};

export default EngagementScoreView;