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
} from "lucide-react";
import { Card } from "../../components/Admin/Card";
import { engagementServices } from "../../services/engagement.services";

// ==================== CONSTANTS & UTILS ====================
const THRESHOLD_RELEVANSI = 0.5;

const KATEGORI_COLORS = {
  "> 0.70": "#db2777",      // Pink Pekat Utama
  "0.40 - 0.70": "#f472b6", // Pink Medium
  "< 0.40": "#f9a8d4",      // Soft Pink
};

const getKategoriColor = (kategori) => KATEGORI_COLORS[kategori] || "#db2777";

// Custom Label Renderers
const RenderScoreLabel = ({ x, y, width, height, value }) => (
  <text
    x={x + width + 8}
    y={y + height / 2}
    dy={4}
    fontSize={12}
    fontWeight={600}
    fill="#334155"
  >
    {typeof value === "number" ? value.toFixed(4) : value}
  </text>
);

const RenderQuizScoreLabel = ({ x, y, width, height, value }) => (
  <text
    x={x + width + 8}
    y={y + height / 2}
    dy={4}
    fontSize={12}
    fontWeight={600}
    fill="#334155"
  >
    {typeof value === "number" ? value.toFixed(1) : value}
  </text>
);

const RenderScatterLabel = ({ x, y, value }) => (
  <text
    x={x}
    y={y - 12}
    fontSize={11}
    fontWeight={600}
    fill="#334155"
    textAnchor="middle"
  >
    {value}
  </text>
);

// Custom Tooltip Style
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

  // Fetch Data Dashboard
  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      setError(null);
      if (isManualRefresh) {
        setIsRefreshing(true);
        // Step 1: Pemicu recalculate batch di FastAPI via Node.js
        await engagementServices.refreshEngagementBatch();
      } else {
        setLoading(true);
      }

      // Step 2: Tarik data terbaru untuk UI
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

  const handleRefresh = () => {
    loadData(true);
  };

  // ==================== DATA TRANSFORMATIONS (MEMOIZED) ====================
  
  // 1. Bar Chart Data: Score Engagement Per Mahasiswa
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
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore);
  }, [rawReports]);

  // 2. Scatter Plot Data
  const scatterData = useMemo(() => {
    return engagementScoreData.map((d) => ({
      nama: d.nama.split(" ")[0], // Ambil nama depan saja
      totalKlik: d.totalKlik,
      avgCosineSimilarity: d.avgCosineSimilarity,
      kategori: d.kategori,
    }));
  }, [engagementScoreData]);

  // 3. Quiz Grade Data
  const quizGradeData = useMemo(() => {
    return quizGrades
      .map((item) => ({
        nama: item.fullname || "Mahasiswa",
        score: parseFloat(item.score || 0),
      }))
      .sort((a, b) => b.score - a.score);
  }, [quizGrades]);

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
        totalMahasiswa > 0
          ? parseFloat(((value / totalMahasiswa) * 100).toFixed(1))
          : 0;
      return { name: key, value, percentage };
    });
  }, [engagementScoreData]);

  // ==================== CONDITIONAL RENDERING ====================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Loading student engagement data...
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
      
      {/* ── BAR CHART: Engagement Score per Mahasiswa ── */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Engagement Score per Student
            </h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            Total: {engagementScoreData.length} Students
          </span>
        </div>

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
                  `Score Range: ${props.payload.kategori}`,
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
      </Card>

      {/* ── GRID: DONUT CHART & SCATTER PLOT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* DONUT CHART: Distribusi Kategori Rentang Angka */}
        <Card className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <PieIcon size={18} className="text-pink-500" />
              <h3 className="text-lg font-bold text-slate-800">
                Engagement Category Distribution
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
                    formatter={(value, name) => [`${value} students`, `Score ${name}`]}
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
            of students fall within the engagement score range{" "}
            <span className="font-semibold">0.40 - 0.70</span>.
          </p>
        </Card>

        {/* SCATTER PLOT: Klik Materi vs Relevansi Pertanyaan */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <ScatterIcon size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Material Clicks vs Question Relevance
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="totalKlik"
                  name="Total Material Clicks"
                  label={{
                    value: "Total Material Clicks",
                    position: "insideBottom",
                    offset: -10,
                    fontSize: 12,
                  }}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="avgCosineSimilarity"
                  name="Avg Cosine Similarity"
                  domain={[0.0, 1.0]}
                  label={{
                    value: "Avg Cosine Similarity",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                  }}
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
                    value: "Relevance Threshold",
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

      {/* ── BAR CHART: Nilai Kuis Pilihan Ganda ── */}
      <Card className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap size={18} className="text-pink-500" />
          <h3 className="text-lg font-bold text-slate-800">
            Multiple Choice Quiz Score per Student
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

      {/* ── TOMBOL REFRESH DATA & RECALCULATE ── */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleRefresh}
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
              : "Calculate & Refresh Data"}
          </span>
        </button>
      </div>

    </div>
  );
};

export default EngagementScoreView;