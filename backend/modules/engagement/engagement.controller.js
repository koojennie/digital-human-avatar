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
}

export default new EngagementController();
