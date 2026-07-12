import React, { useState, useEffect } from "react";
import {
  Mic,
  MessageSquare,
  Hash,
  BrainCircuit,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, StatCard } from "../../components/admin/card";
import { engagementServices } from "../../services/engagement.services";

// ── Skema Warna Collexa (Indigo untuk Text, Pink untuk Voice) ──────────────────
const FEATURE_COLORS = {
  "Type Message": "#6366f1", // Indigo
  "Voice Note": "#ec4899",   // Pink
};

const DEFAULT_COLOR = "#cbd5e1";

const TOPIC_COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

const EngagementAnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        const result = await engagementServices.getDashboardOverview();

        console.log('result ' , result.data);
        

        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Gagal memuat data engagement via dashboardServices:", error);
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
        <p className="text-slate-500 font-medium animate-pulse">
          Analyzing student engagement...
        </p>
      </div>
    );
  }

  // Safe Extraction dengan Fallback value untuk mencegah runtime error
  const totalMessages = data?.discussionDepth?.totalUserMessages ?? 0;
  const avgMessages = data?.discussionDepth?.avgMessagesPerSession ?? 0;
  const voicePct = data?.featureAdoption?.voicePercentage ?? 0;
  const chartData = data?.featureAdoption?.chartData ?? [];
  const keywords = data?.wordCloudKeywords ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── SECTION 1: DEPTH METRICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Student Interactions"
          value={totalMessages}
          icon={MessageSquare}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Avg. Message Per Session"
          value={`${avgMessages} msg`}
          icon={BrainCircuit}
          colorClass="bg-pink-50 text-pink-600"
        />
        <StatCard
          label="Voice Utilization"
          value={`${voicePct}%`}
          icon={Mic}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ── SECTION 2: FEATURE ADOPTION RATIO ── */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-pink-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Feature Adoption Ratio
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FEATURE_COLORS[entry.name] || DEFAULT_COLOR}
                    />
                  ))}
                </Pie>
                <Tooltip
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
            Students utilize the voice feature for{" "}
            <span className="font-bold text-pink-500">
              {voicePct}%
            </span>{" "}
            of their discussions.
          </p>
        </Card>

        {/* ── SECTION 3: TRENDING ACADEMIC TOPICS ── */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Hash size={18} className="text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Trending Academic Topics
            </h3>
          </div>
          
          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto pr-2">
              {keywords.map((topic, i) => {
                // Bersihkan spasi di awal/akhir kata kunci jika ada dari API
                const cleanedText = topic.text.trim();
                return (
                  <div
                    key={i}
                    className={`px-3.5 py-1.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 cursor-default shadow-sm border ${
                      TOPIC_COLORS[i % TOPIC_COLORS.length]
                    }`}
                  >
                    <span className="font-semibold text-xs md:text-sm"># {cleanedText}</span>
                    <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full font-bold">
                      {topic.value}x
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-slate-400">
              No trending topics detected this week.
            </div>
          )}

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-pink-600">Pro-Tip:</span> The
              topics listed above represent the VClass keywords causing the most
              confusion or active discussion among students this week.
            </p>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default EngagementAnalyticsView;