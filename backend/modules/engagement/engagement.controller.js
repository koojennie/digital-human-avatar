import engagementServices from "./engagement.services.js";

class EngagementController {
  async getEngagementAnalytics(req, res) {
    try {
      const data = await engagementServices.getEngagementDashboardData();

      return res.status(200).json({
        success: true,
        message: "Data keterikatan (engagement) mahasiswa berhasil ditarik.",
        data: data,
      });
    } catch (error) {
      console.error("🚨 [ENGAGEMENT CONTROLLER ERROR] ->", error.message);
      return res.status(500).json({
        success: false,
        message: "Gagal menyusun ringkasan statistik keterikatan.",
      });
    }
  }

  async getDashboardReport(req, res) {
    try {
      const reports =
        await engagementRepository.getEngagementDashboardCosineSimilarity();
      return res.status(200).json({
        success: true,
        message: "Data dashboard engagement berhasil diambil.",
        data: reports,
      });
    } catch (error) {
      console.error(
        "❌ Error pada EngagementController.getDashboardReport:",
        error,
      );
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard engagement.",
        error: error.message,
      });
    }
  }
}

export default new EngagementController();
