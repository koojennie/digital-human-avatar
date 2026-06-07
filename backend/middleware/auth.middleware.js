import jwt from "jsonwebtoken";
import { AuthService } from "../modules/auth/auth.service.js";

export const isAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "TOKEN_MISSING",
        message: "Akses ditolak. Token autentikasi tidak ditemukan.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN_FORMAT",
        message:
          "Format autentikasi tidak sah. Gunakan format 'Bearer <token>'.",
      });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET || "RAHASIA_BACKEND_AVATAR_123";
    const decoded = jwt.verify(token, secretKey);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN_ACCESS",
        message: "Anda tidak memiliki hak akses untuk membuka halaman ini.",
      });
    }

    const user = await authService.validateUserById(decoded.user_id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    req.user = user;
    next();
  } catch (error) {
    // Jika token kedaluwarsa atau corrupt (401)
    return res.status(401).json({
      success: false,
      error:
        error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
      message: "Token tidak valid atau sudah kedaluwarsa.",
      debug: error.message, // Opsional: hanya untuk development lingkungan lokal
    });
  }
};
