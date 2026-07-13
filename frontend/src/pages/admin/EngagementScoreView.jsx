import React, { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";
import { Card } from "../../components/admin/card";
import { engagementServices } from "../../services/engagement.services";

const THRESHOLD_RELEVANSI = 0.5;

const KATEGORI_COLORS = {
  Tinggi: "#22c55e",  // Hijau
  Sedang: "#f59e0b",  // Oranye
  Rendah: "#ef4444",  // Merah
};

const renderScoreLabel = (props) => {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fontSize={12}
      fontWeight={600}
      fill="#334155"
    >
      {value.toFixed(4)}
    </text>
  );
};

const renderScatterLabel = (props) => {
  const { x, y, value } = props;
  return (
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
};

const EngagementScoreView = () => {
  const [rawReports, setRawReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (showOverlayLoading = false) => {
    try {
      if (showOverlayLoading) setIsRefreshing(true);
      else setLoading(true);

      const response = await engagementServices.getDashboardOverview();
      const studentReports = response?.data?.studentReports ?? [];
      
      setRawReports(studentReports);
    } catch (error) {
      console.error("Gagal memuat student engagement reports:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Memperbaiki handleRefresh agar memanggil API endpoint yang sesungguhnya
  const handleRefresh = () => {
    loadData(true);
  };

  // Memetakan data sesuai dengan struktur JSON endpoint
  const engagementScoreData = rawReports
    .map((item) => ({
      nama: item.nama_mahasiswa,
      totalKlik: item.total_klik,
      totalPertanyaan: item.total_pertanyaan,
      avgCosineSimilarity: parseFloat(item.avg_cosine_similarity || 0),
      engagementScore: parseFloat(item.engagement_score || 0),
      kategori: item.kategori || "Sedang",
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore);

  const scatterData = engagementScoreData.map((d) => ({
    nama: d.nama.split(" ")[0], // Ambil nama depan agar chart tidak padat
    totalKlik: d.totalKlik,
    avgCosineSimilarity: d.avgCosineSimilarity,
    kategori: d.kategori,
  }));

  const totalMahasiswa = engagementScoreData.length;
  const counts = engagementScoreData.reduce(
    (acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + 1;
      return acc;
    },
    { Tinggi: 0, Sedang: 0, Rendah: 0 }
  );

  const engagementDistributionData = Object.keys(counts).map((key) => {
    const value = counts[key];
    const percentage =
      totalMahasiswa > 0
        ? parseFloat(((value / totalMahasiswa) * 100).toFixed(1))
        : 0;
    return { name: key, value, percentage };
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <div className="w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading student engagement data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── BAR CHART: Engagement Score per Mahasiswa ── */}
      <Card className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-indigo-500" />
          <h3 className="text-lg font-bold text-slate-800">
            Engagement Score per Mahasiswa
          </h3>
        </div>
        <div style={{ height: engagementScoreData.length * 36 + 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={engagementScoreData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <YAxis
                type="category"
                dataKey="nama"
                width={160}
                tick={{ fontSize: 12, fill: "#334155" }}
              />
              <Tooltip
                formatter={(value, _name, props) => [
                  value.toFixed(4),
                  `Kategori: ${props.payload.kategori}`,
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="engagementScore" radius={[0, 6, 6, 0]}>
                <LabelList
                  dataKey="engagementScore"
                  content={renderScoreLabel}
                />
                {engagementScoreData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={KATEGORI_COLORS[entry.kategori]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── GRID: DONUT CHART & SCATTER PLOT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* DONUT CHART: Distribusi Kategori */}
        <Card className="p-8">
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
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={false}
                >
                  {engagementDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={KATEGORI_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} mahasiswa`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            <span
              className="font-bold"
              style={{ color: KATEGORI_COLORS.Sedang }}
            >
              {engagementDistributionData.find((d) => d.name === "Sedang")?.percentage || 0}%
            </span>{" "}
            mahasiswa berada pada kategori engagement{" "}
            <span className="font-semibold">Sedang</span>.
          </p>
        </Card>

        {/* SCATTER PLOT: Klik Materi vs Relevansi Pertanyaan */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <ScatterIcon size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Klik Materi vs Relevansi Pertanyaan
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="totalKlik"
                  name="Total Klik Materi"
                  label={{
                    value: "Total Klik Materi",
                    position: "insideBottom",
                    offset: -10,
                    fontSize: 12,
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="avgCosineSimilarity"
                  name="Avg Cosine Similarity"
                  domain={[0.2, 0.9]}
                  label={{
                    value: "Avg Cosine Similarity",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                  }}
                  tick={{ fontSize: 12 }}
                />
                <ZAxis range={[120, 120]} />
                <ReferenceLine
                  y={THRESHOLD_RELEVANSI}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: "Threshold relevansi",
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(3) : value,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Scatter data={scatterData}>
                  <LabelList dataKey="nama" content={renderScatterLabel} />
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={KATEGORI_COLORS[entry.kategori]}
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

      {/* ── TOMBOL REFRESH DATA ── */}
      <div className="flex justify-center">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-pink-600 font-semibold text-sm hover:bg-pink-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Memuat ulang..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
};

export default EngagementScoreView;