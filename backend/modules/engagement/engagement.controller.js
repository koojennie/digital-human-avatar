import engagementServices from "./engagement.services.js";
import { HuggingFaceService } from "../huggingface.services.js";

class EngagementController {
  // Instansiasi instance service
  huggingFaceServices = new HuggingFaceService();

  // 1. Main Analytics Endpoint (Mengembalikan full dashboard overview + mapped student reports)
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
        error: error.message,
      });
    }
  };

  // 2. Specific Reports Endpoint (Mengambil daftar student reports yang sudah ter-mapping)
  getDashboardReport = async (req, res) => {
    try {
      // 🎯 FIX: Panggil via engagementServices agar data studentReports 
      // sudah menyertakan mapping kategori '0.40 - 0.70' & 'created_at'
      const overviewData = await engagementServices.getEngagementDashboardData();
      
      return res.status(200).json({
        success: true,
        message: "Data dashboard engagement berhasil diambil.",
        data: overviewData.studentReports,
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

  // 3. Batch Monitoring Methods
  checkBatchStatus = async (req, res) => {
    try {
      const status = await this.huggingFaceServices.getBatchStatus();
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  pauseBatchProcess = async (req, res) => {
    try {
      const result = await this.huggingFaceServices.pauseBatch();
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  resumeBatchProcess = async (req, res) => {
    try {
      const result = await this.huggingFaceServices.resumeBatch();
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };

  refreshEngagementData = async (req, res) => {
    try {
      const result = await this.huggingFaceServices.triggerBatchSync();
      return res.status(200).json({
        success: true,
        message: result.message || "Batch recalculate berhasil dipicu.",
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
}

export default new EngagementController();