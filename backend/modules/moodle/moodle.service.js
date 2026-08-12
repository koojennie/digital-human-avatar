import { UserRepository } from "../user/user.repository.js";
import jwt from "jsonwebtoken";
import { MoodleRepository } from "./moodle.repository.js";

export class MoodleServices {
  API_URL_MOODLE = process.env.MOODLE_API_URL;
  MOODLE_TOKEN = process.env.MOODLE_TOKEN;

  constructor() {
    this.moodleRepository = new MoodleRepository();
  }

  async getUserMoodleByUserId({ moodleUserId }) {
    const params = new URLSearchParams({
      wstoken: this.MOODLE_TOKEN,
      wsfunction: "core_user_get_users_by_field",
      moodlewsrestformat: "json",
      field: "id",
      "values[0]": moodleUserId,
    });

    const url = `${this.API_URL_MOODLE}/webservice/rest/server.php?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch Moodle user");
    }

    return res.json();
  }

  async loginViaMoodle(username, password) {
    try {
      const paramsLogin = new URLSearchParams({
        username: username,
        password: password,
        service: "moodle_mobile_app",
      });

      const loginUrl = `${this.API_URL_MOODLE}/login/token.php?${paramsLogin.toString()}`;

      const loginResponse = await fetch(loginUrl, {
        method: "GET",
      });

      if (!loginResponse.ok) {
        throw new Error("Failed to login into moodle");
      }

      const tokenResponse = await loginResponse.json();

      const moodleToken = tokenResponse.token;

      if (!moodleToken || tokenResponse.error) {
        throw new Error(
          tokenResponse.error || "Username atau password Moodle salah.",
        );
      }

      // step2
      const paramsInfoResponse = new URLSearchParams({
        wstoken: moodleToken,
        wsfunction: "core_webservice_get_site_info",
        moodlewsrestformat: "json",
      });

      const infoUrl = `${this.API_URL_MOODLE}/webservice/rest/server.php?${paramsInfoResponse.toString()}`;

      const infoResponse = await fetch(infoUrl, { method: "GET" });

      if (!infoResponse.ok) {
        throw new Error("Gagal mengambil informasi profil dari server Moodle.");
      }

      const moodleUserData = await infoResponse.json();

      if (!moodleUserData || moodleUserData.error || moodleUserData.exception) {
        throw new Error("Gagal mengambil informasi situs moodle");
      }

      const moodleUserId = moodleUserData.userid;
      const moodleUsername = moodleUserData.username;

      const normalizedUsername = String(moodleUsername || "").toLowerCase();

      if (moodleUsername !== "admin" && !normalizedUsername.includes("dosen")) {
        throw new Error("Username bukan admin, anda bukan admin");
      }

      // initalize object UserRepostory
      const userRepository = new UserRepository();

      const user = await userRepository.findUserByMoodleId(
        parseInt(moodleUserId),
      );

      if (!user) {
        throw new Error(
          "Akun Moodle Anda terverifikasi, tetapi belum terdaftar di sistem ini.",
        );
      }

      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET || "JWT_SECRET_KAMU",
        { expiresIn: "1d" },
      );

      return { user, token };
    } catch (eror) {
      throw new Error(
        eror.message || "Terjadi kesalahan saat login via Moodle.",
      );
    }
  }

  async getCourseMoodleByCourseId({ courseId }) {
    const params = new URLSearchParams({
      wstoken: this.MOODLE_TOKEN,
      wsfunction: "core_course_get_courses_by_field",
      moodlewsrestformat: "json",
      field: "id",
      value: courseId,
    });

    const url = `${this.API_URL_MOODLE}/webservice/rest/server.php?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Moodle user");
    }

    return res.json();
  }

  async getQuizGrades({ quizId }) {
    try {
      const grades = await this.moodleRepository.getQuizGrades(quizId);

      return grades;
    } catch (error) {
      console.log("Error getQuizGrades moodle services", error);
      throw new Error(error.message || "Gagal mengambil nilai quiz.");
    }
  }
}
