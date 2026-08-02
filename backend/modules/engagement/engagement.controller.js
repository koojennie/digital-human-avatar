import engagementServices from "./engagement.services.js";
import { HuggingFaceService } from "../huggingface.services.js";

class EngagementController {
  // Instansiasi instance service
  huggingFaceServices = new HuggingFaceService();

  // 1. Gunakan Arrow Function pada method yang dipanggil route Express
  getEngagementAnalytics = async (req, res) => {
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
  };

  getDashboardReport = async (req, res) => {
    try {
      const reports = await engagementRepository.getEngagementDashboardCosineSimilarity();
      return res.status(200).json({
        success: true,
        message: "Data dashboard engagement berhasil diambil.",
        data: reports,
      });
    } catch (error) {
      console.error("❌ Error pada EngagementController.getDashboardReport:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data dashboard engagement.",
        error: error.message,
      });
    }
  };

  checkBatchStatus = async (req, res) => {
    try {
      // 💡 FIX: Pakai this.huggingFaceServices
      const status = await this.huggingFaceServices.getBatchStatus();
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  pauseBatchProcess = async (req, res) => {
    try {
      // 💡 FIX: Pakai this.huggingFaceServices
      const result = await this.huggingFaceServices.pauseBatch();
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  resumeBatchProcess = async (req, res) => {
    try {
      // 💡 FIX: Pakai this.huggingFaceServices
      const result = await this.huggingFaceServices.resumeBatch();
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  refreshEngagementData = async (req, res) => {
    try {
      // 💡 FIX: this.huggingFaceServices sekarang aman dan ter-bind penuh
      const result = await this.huggingFaceServices.triggerBatchSync();
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
}

export default new EngagementController();