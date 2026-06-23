import dashboardRepository from "./dashboard.repository.js";

class DashboardService {
  async getMainDashboardStash() {
    const [dailyStats,weeklyStats, leaderboardStats, totalUsers] = await Promise.all([
      dashboardRepository.getDailyTrends(),
      dashboardRepository.getWeeklyTrends(),
      dashboardRepository.getUserLeaderboard(7),
      dashboardRepository.getTotalUsers(),
    ]);    

    const formattedLeaderboard = leaderboardStats.map((item, index) => {
      return {
        id: item.user_id || index + 1,
        full_name: item.full_name || "Mahasiswa VClass",
        username: item.username || "student",
        count: parseInt(item.count, 10),
      };
    });

    return {
      dailyData: dailyStats.map(d => ({ label: d.label, count: parseInt(d.count, 10) })),
      weeklyData: weeklyStats.map(w => ({ label: w.label, count: parseInt(w.count, 10) })),
      leaderboard: formattedLeaderboard,
      totalUsers,
    };
  }
}

export default new DashboardService();
