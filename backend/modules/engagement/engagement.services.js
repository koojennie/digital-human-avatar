import engagementRepository from "./engagement.repository.js";

class EngagmentServices {
  async getEngagementDashboardData() {
    const [
      featureAdoptionStats,
      discussionDepthStats,
      topKeywords,
      topCourses,
      reportsEngagementConsineSimiliarity,
    ] = await Promise.all([
      engagementRepository.getFeatureAdoptionStats(),
      engagementRepository.getDiscussionDepthStats(),
      engagementRepository.getTopKeywords(12),
      engagementRepository.getTopCoursesByEngagement(5),
      engagementRepository.getEngagementDashboardCosineSimilarity(),
    ]);

    // 1. Kalkulasi Persentase Adopsi Fitur Suara (Voice)
    let textCount = 0;
    let voiceCount = 0;

    featureAdoptionStats.forEach((stat) => {
      if (stat.type === "text") textCount = parseInt(stat.total, 10);
      if (stat.type === "voice") voiceCount = parseInt(stat.total, 10);
    });

    const totalAdoption = textCount + voiceCount;
    const voicePercentage =
      totalAdoption > 0 ? Math.round((voiceCount / totalAdoption) * 100) : 0;

    // 2. Mapping Kategori & Buat Summary Distribution
    const distribusiKategori = {
      "> 0.70": 0,
      "0.40 - 0.70": 0,
      "< 0.40": 0,
    };

    const mappedReports = reportsEngagementConsineSimiliarity.map((student) => {
      const score = parseFloat(student.engagement_score || 0);
      let rentangKategori = "0.40 - 0.70";

      if (score > 0.7) {
        rentangKategori = "> 0.70";
      } else if (score < 0.4) {
        rentangKategori = "< 0.40";
      }

      distribusiKategori[rentangKategori]++;

      return {
        ...student,
        kategori: rentangKategori, // Dynamic category range
        created_at: student.last_updated_at, // Mapping alias tanggal jika diperlukan filter date
        user_created_at: student.user?.created_at || student["user.created_at"] || null,
      };
    });

    return {
      // 🎯 FIX: Return `mappedReports` bukan data mentahnya
      studentReports: mappedReports,
      lastUpdatedAt:
        mappedReports.length > 0 ? mappedReports[0].last_updated_at : null,
      summaryDistribution: distribusiKategori,

      discussionDepth: {
        totalUserMessages: discussionDepthStats.totalMessages,
        totalConversations: discussionDepthStats.totalSessions,
        avgMessagesPerSession: parseFloat(
          discussionDepthStats.averageMessagesPerSession || 0
        ),
      },
      featureAdoption: {
        voicePercentage: voicePercentage,
        textPercentage: 100 - voicePercentage,
        chartData: [
          { name: "Type Message", value: textCount },
          { name: "Voice Note", value: voiceCount },
        ],
      },
      wordCloudKeywords: topKeywords.map((k) => ({
        text: k.text || "Topik Umum",
        value: parseInt(k.value || 0, 10),
      })),
      topAcademicCourses: topCourses.map((c) => ({
        courseName: c.courseName || "Mata Kuliah Umum",
        messagesVolume: parseInt(c.messageCount || 0, 10),
      })),
    };
  }
}

export default new EngagmentServices();