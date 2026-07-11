import React, { useState } from "react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  ResponsiveContainer, Legend, LabelList
} from "recharts";
import { BarChart3, PieChart as PieIcon, ScatterChart as ScatterIcon, RefreshCw } from "lucide-react";
import { Card } from "../../components/admin/card";

// ── Data statis engagement mahasiswa — di-generate dari student_engagement_reports_rows.csv ──
// Diurutkan descending berdasarkan engagement_score (tertinggi di atas).
const engagementScoreData = [
  { nama: 'Alia Jennifer Kim Ritzky', totalKlik: 10, totalPertanyaan: 15, avgCosineSimilarity: 0.7645, engagementScore: 0.8823, kategori: 'Tinggi' },
  { nama: 'Kartika Putri', totalKlik: 8, totalPertanyaan: 14, avgCosineSimilarity: 0.7123, engagementScore: 0.7562, kategori: 'Tinggi' },
  { nama: 'Joko Susilo', totalKlik: 8, totalPertanyaan: 12, avgCosineSimilarity: 0.6852, engagementScore: 0.7426, kategori: 'Tinggi' },
  { nama: 'Mega Utami', totalKlik: 6, totalPertanyaan: 10, avgCosineSimilarity: 0.6554, engagementScore: 0.6277, kategori: 'Sedang' },
  { nama: 'Fadhil Rahman', totalKlik: 6, totalPertanyaan: 8, avgCosineSimilarity: 0.6431, engagementScore: 0.6216, kategori: 'Sedang' },
  { nama: 'Hendra Kusuma', totalKlik: 6, totalPertanyaan: 7, avgCosineSimilarity: 0.6120, engagementScore: 0.6060, kategori: 'Sedang' },
  { nama: 'Gita Permata', totalKlik: 6, totalPertanyaan: 9, avgCosineSimilarity: 0.5987, engagementScore: 0.5994, kategori: 'Sedang' },
  { nama: 'Indah Sari', totalKlik: 6, totalPertanyaan: 5, avgCosineSimilarity: 0.5842, engagementScore: 0.5921, kategori: 'Sedang' },
  { nama: 'Citra Lestari', totalKlik: 5, totalPertanyaan: 6, avgCosineSimilarity: 0.5521, engagementScore: 0.5261, kategori: 'Sedang' },
  { nama: 'Putra Pratama', totalKlik: 4, totalPertanyaan: 5, avgCosineSimilarity: 0.5341, engagementScore: 0.4671, kategori: 'Sedang' },
  { nama: 'Naufal Rizqi', totalKlik: 4, totalPertanyaan: 5, avgCosineSimilarity: 0.5118, engagementScore: 0.4559, kategori: 'Sedang' },
  { nama: 'Olivia Wong', totalKlik: 4, totalPertanyaan: 3, avgCosineSimilarity: 0.4954, engagementScore: 0.4477, kategori: 'Sedang' },
  { nama: 'Budi Santoso', totalKlik: 4, totalPertanyaan: 4, avgCosineSimilarity: 0.4812, engagementScore: 0.4406, kategori: 'Sedang' },
  { nama: 'Ratna Dewi', totalKlik: 2, totalPertanyaan: 3, avgCosineSimilarity: 0.4321, engagementScore: 0.3161, kategori: 'Rendah' },
  { nama: 'Eka Wijaya', totalKlik: 2, totalPertanyaan: 2, avgCosineSimilarity: 0.4120, engagementScore: 0.3060, kategori: 'Rendah' },
  { nama: 'Satria Baja', totalKlik: 2, totalPertanyaan: 1, avgCosineSimilarity: 0.3850, engagementScore: 0.2925, kategori: 'Rendah' },
  { nama: 'Lukman Hakim', totalKlik: 1, totalPertanyaan: 2, avgCosineSimilarity: 0.3540, engagementScore: 0.2270, kategori: 'Rendah' },
  { nama: 'Dimas Prabowo', totalKlik: 1, totalPertanyaan: 1, avgCosineSimilarity: 0.3210, engagementScore: 0.2105, kategori: 'Rendah' },
];

// Distribusi kategori engagement (untuk donut chart)
const engagementDistributionData = [
  { name: 'Tinggi', value: 3, percentage: 16.7 },
  { name: 'Sedang', value: 10, percentage: 55.6 },
  { name: 'Rendah', value: 5, percentage: 27.8 },
];

// Data scatter: Total Klik Materi vs Avg Cosine Similarity (relevansi pertanyaan)
const scatterData = engagementScoreData.map((d) => ({
  nama: d.nama.split(' ')[0], // pakai nama depan saja biar label tidak numpuk
  totalKlik: d.totalKlik,
  avgCosineSimilarity: d.avgCosineSimilarity,
  kategori: d.kategori,
}));

const THRESHOLD_RELEVANSI = 0.5;

// Mapping warna traffic-light per kategori, dipakai konsisten di semua chart
const KATEGORI_COLORS = {
  Tinggi: '#22c55e', // hijau
  Sedang: '#f59e0b', // oranye
  Rendah: '#ef4444', // merah
};

// ── Custom label untuk bar chart: score tetap terbaca di ujung bar ──────────
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

// ── Custom label untuk titik scatter: tampilkan nama depan di atas titik ────
const renderScatterLabel = (props) => {
  const { x, y, value } = props;
  return (
    <text x={x} y={y - 12} fontSize={11} fontWeight={600} fill="#334155" textAnchor="middle">
      {value}
    </text>
  );
};

const EngagementScoreView = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: ganti dengan pemanggilan ulang API/fetch data yang sesungguhnya
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── HORIZONTAL BAR CHART: Engagement Score per Mahasiswa (full width) ── */}
      <Card className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={18} className="text-indigo-500" />
          <h3 className="text-lg font-bold text-slate-800">Engagement Score per Mahasiswa</h3>
        </div>
        <div style={{ height: engagementScoreData.length * 32 + 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={engagementScoreData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              barCategoryGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
              <YAxis
                type="category"
                dataKey="nama"
                width={160}
                tick={{ fontSize: 12, fill: "#334155" }}
              />
              <Tooltip
                formatter={(value, _name, props) => [value.toFixed(4), `Kategori: ${props.payload.kategori}`]}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
              <Bar dataKey="engagementScore" radius={[0, 6, 6, 0]}>
                <LabelList dataKey="engagementScore" content={renderScoreLabel} />
                {engagementScoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={KATEGORI_COLORS[entry.kategori]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── DONUT CHART + SCATTER PLOT (berdampingan di bawah) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* DONUT CHART: Distribusi Kategori Engagement */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">Distribusi Kategori Engagement</h3>
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
                    <Cell key={`cell-${index}`} fill={KATEGORI_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} mahasiswa`, name]}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            <span className="font-bold" style={{ color: KATEGORI_COLORS.Sedang }}>
              {engagementDistributionData.find((d) => d.name === "Sedang")?.percentage}%
            </span>{" "}
            mahasiswa berada pada kategori engagement <span className="font-semibold">Sedang</span>.
          </p>
        </Card>

        {/* SCATTER PLOT: Klik Materi vs Relevansi Pertanyaan */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <ScatterIcon size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">Klik Materi vs Relevansi Pertanyaan</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="totalKlik"
                  name="Total Klik Materi"
                  label={{ value: "Total Klik Materi", position: "insideBottom", offset: -10, fontSize: 12 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="avgCosineSimilarity"
                  name="Avg Cosine Similarity"
                  domain={[0.3, 0.8]}
                  label={{ value: "Avg Cosine Similarity", angle: -90, position: "insideLeft", fontSize: 12 }}
                  tick={{ fontSize: 12 }}
                />
                <ZAxis range={[120, 120]} />
                <ReferenceLine
                  y={THRESHOLD_RELEVANSI}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: "Threshold relevansi", position: "insideTopRight", fontSize: 11, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) => [typeof value === "number" ? value.toFixed(3) : value, name]}
                  labelFormatter={() => ""}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
                <Scatter data={scatterData}>
                  <LabelList dataKey="nama" content={renderScatterLabel} />
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={KATEGORI_COLORS[entry.kategori]} stroke="#fff" strokeWidth={1} />
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