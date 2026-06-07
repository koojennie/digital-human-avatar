import jwt from 'jsonwebtoken';
import { MoodleServices } from "../moodle/moodle.service.js";

export class AuthController {
  constructor() {
    this.moodleServices = new MoodleServices();
    
    this.login = this.login.bind(this);
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Username dan password wajib diisi.",
        });
      }

      const { user } = await this.moodleServices.loginViaMoodle(username, password);

      const payload = {
        user_id: user.user_id,
        role: user.role,
      };

      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        throw new Error("JWT_SECRET_MISSING");
      }

      const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });

      return res.status(200).json({
        success: true, 
        message: "Login successfully via Moodle",
        data: {
          token,
          user: {
            username: user.username,
            full_name: user.full_name,
            role: user.role,
          },
        },
      });

    } catch (error) {
      if (error.message === "JWT_SECRET_MISSING") {
        console.error("CRITICAL CONFIG ERROR: process.env.JWT_SECRET belum diset!");
        return res.status(500).json({
          success: false,
          error: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan konfigurasi pada server.",
        });
      }

      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_FAILED",
        message: error.message || "Gagal melakukan otentikasi via Moodle.",
      });
    }
  }
}
