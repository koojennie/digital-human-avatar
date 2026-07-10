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

    // Kalkulasi Persentase Adopsi Fitur Suara (Voice)
    let textCount = 0;
    let voiceCount = 0;

    featureAdoptionStats.forEach((stat) => {
      if (stat.type === "text") textCount = parseInt(stat.total, 10);
      if (stat.type === "voice") voiceCount = parseInt(stat.total, 10);
    });

    const totalAdoption = textCount + voiceCount;
    const voicePercentage =
      totalAdoption > 0 ? Math.round((voiceCount / totalAdoption) * 100) : 0;

    const distribusiKategori = { Tinggi: 0, Sedang: 0, Rendah: 0 };
    reportsEngagementConsineSimiliarity.forEach((student) => {
      if (distribusiKategori[student.kategori] !== undefined) {
        distribusiKategori[student.kategori]++;
      }
    });

    return {
      studentReports: reportsEngagementConsineSimiliarity,
      lastUpdatedAt:
        reportsEngagementConsineSimiliarity.length > 0
          ? reportsEngagementConsineSimiliarity[0].last_updated_at
          : null,
      summaryDistribution: distribusiKategori,

      discussionDepth: {
        totalUserMessages: discussionDepthStats.totalMessages,
        totalConversations: discussionDepthStats.totalSessions,
        avgMessagesPerSession: parseFloat(
          discussionDepthStats.averageMessagesPerSession,
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
        text: k.word,
        value: parseInt(k.frequency, 10),
      })),
      topAcademicCourses: topCourses.map((c) => ({
        courseName: c.courseName || "Mata Kuliah Umum",
        messagesVolume: parseInt(c.messageCount, 10),
      })),
    };
  }
}

export default new EngagmentServices();
