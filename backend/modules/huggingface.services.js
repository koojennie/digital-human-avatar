import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export class HuggingFaceService {
  // generate Speech
  async generateSpeech(text) {
    const response = await fetch(`${process.env.HUGGINGFACE_URL_API}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate speech");
    }

    return await response.json();
  }

  async convertSoundToText(audio) {
    const response = await fetch(`${process.env.HUGGINGFACE_URL_API}/stt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: audio,
      }),
    });

    let result;
    try {
      result = await response.json();
    } catch (err) {
      if (!response.ok) {
        throw new Error(
          `Failed to convert sound to text. Status: ${response.status}`,
        );
      }
      throw err;
    }

    if (!response.ok) {
      let errorMessage =
        result.detail || result.error || "Failed to convert sound to text";
      if (typeof errorMessage === "object")
        errorMessage = JSON.stringify(errorMessage);
      throw new Error(errorMessage);
    }

    return result;
  }

  // ==================== FAST API SCHEDULER SERVICES ====================
  #getFastApiBaseUrl() {
    return process.env.FASTAPI_BASE_URL || "http://localhost:7860";
  }

  // 🚀 1. Cek Status Scheduler & Jadwal Running Berikutnya (next_run_time)
  async getBatchStatus() {
    const baseUrl = this.#getFastApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/engagement/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`FAST API status error: ${response.statusText}`);
    }

    // Mengembalikan object: { scheduler_running, job_status, next_run_time }
    return await response.json();
  }

  // 🚀 2. Matikan (Pause) Automation Batch
  async pauseBatch() {
    const baseUrl = this.#getFastApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/engagement/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Fast API pause Error: ${response.statusText}`);
    }

    return await response.json();
  }

  // 🚀 3. Nyalakan Kembali (Resume) Automation Batch
  async resumeBatch() {
    const baseUrl = this.#getFastApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/engagement/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`FastAPI resume error: ${response.statusText}`);
    }
    return await response.json();
  }

  // 🚀 4. Manual Trigger Sync (Nembak & Tunggu Kalkulasi Beres + Terima Data Baru)
  async triggerBatchSync() {
    const baseUrl = this.#getFastApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/engagement/trigger-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`FastAPI trigger-sync error: ${response.statusText}`);
    }

    // Mengembalikan object: { status, message, data }
    return await response.json();
  }

  // 🚀 5. Ambil Data Report Cepat dari Cache Tabel
  async getEngagementReports() {
    const baseUrl = this.#getFastApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/engagement`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`FastAPI get engagement error: ${response.statusText}`);
    }

    return await response.json();
  }
}
