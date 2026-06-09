import dashboardService from "./dashboard.service.js";

class DashboardController {
  async getDashboardOverview(req, res) {
    try {
      const dashboardData = await dashboardService.getMainDashboardStash();

      return res.status(200).json({
        success: true,
        message: "Data Summary dashboard has successfully.",
        data: dashboardData,
      });
    } catch (error) {
      console.error("🚨 [DASHBOARD CONTROLLER ERROR] ->", error.message);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil statistik data internal dashboard.",
      });
    }
  }
}

export default new DashboardController();
