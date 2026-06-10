import engagementRepository from "./engagement.repository.js";

class EngagmentServices {
  async getEngagementDashboardData() {
    const [featureAdoptionStats, discussionDepthStats, topKeywords, topCourses] =
      await Promise.all([
        engagementRepository.getFeatureAdoptionStats(),
        engagementRepository.getDiscussionDepthStats(),
        engagementRepository.getTopKeywords(12),
        engagementRepository.getTopCoursesByEngagement(5),
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

    return {
      discussionDepth: {
        totalUserMessages: discussionDepthStats.totalMessages,
        totalConversations: discussionDepthStats.totalSessions,
        avgMessagesPerSession: parseFloat(discussionDepthStats.averageMessagesPerSession),
      },
      featureAdoption: {
        voicePercentage: voicePercentage,
        textPercentage: 100 - voicePercentage,
        chartData: [
          { name: "Ketik Teks", value: textCount },
          { name: "Pesan Suara", value: voiceCount },
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
