import React, { useState, useEffect } from "react";
import { 
  Mic, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Hash, 
  BrainCircuit, 
  Zap,
  ChevronRight,
  Badge
} from "lucide-react";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from "recharts";
import { Card, StatCard } from "../../components/Admin/Card";

// ── Warna Estetika (Matching Collexa Pink & Indigo) ──────────────────────────
const COLORS = ["#6366f1", "#ec4899"]; // Indigo untuk Text, Pink untuk Voice
const TOPIC_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

const EngagementAnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/v1/analytics/engagement", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Gagal memuat data engagement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Menganalisis keterikatan mahasiswa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── SECTION 1: DEPTH METRICS (Stat Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Interaksi Mahasiswa"
          value={data?.discussionDepth?.totalUserMessages}
          icon={MessageSquare}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Kedalaman Diskusi (Avg)"
          value={`${data?.discussionDepth?.avgMessagesPerSession} pesan`}
          icon={BrainCircuit}
          colorClass="bg-pink-50 text-pink-600"
        />
        <StatCard
          label="Pemanfaatan Voice"
          value={`${data?.featureAdoption?.voicePercentage}%`}
          icon={Mic}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── SECTION 2: FEATURE ADOPTION (Pie Chart) ── */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">Feature Adoption Ratio</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.featureAdoption?.chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.featureAdoption?.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            Mahasiswa cenderung menggunakan <span className="font-bold text-pink-500">{data?.featureAdoption?.voicePercentage}%</span> fitur suara saat berdiskusi.
          </p>
        </Card>

        {/* ── SECTION 3: TOP ACADEMIC TOPICS (Keywords/WordCloud alternative) ── */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Hash size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">Trending Academic Topics</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {data?.wordCloudKeywords.map((topic, i) => (
              <div 
                key={i}
                className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 cursor-default shadow-sm border border-white/50 ${TOPIC_COLORS[i % TOPIC_COLORS.length]}`}
              >
                <span className="font-bold"># {topic.text}</span>
                <span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded-full">{topic.value}x</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-xs text-slate-500 leading-relaxed">
               <span className="font-bold text-indigo-600">Pro-Tip:</span> Topik di atas adalah kata kunci materi VClass yang paling banyak membingungkan mahasiswa minggu ini.
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EngagementAnalyticsView;