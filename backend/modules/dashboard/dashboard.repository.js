import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";
import { sequelize } from "../../utils/supabaseClient.js";
import { Op } from "sequelize";

class DashboardRepository {
  // ── TREN HARIAN (Menghitung Volume Chat 14 Hari Terakhir) ──
  async getDailyTrends() {
    return await Conversation.findAll({
      attributes: [
        [
          sequelize.fn(
            "TO_CHAR",
            sequelize.col("messages.created_at"),
            "DD Mon"
          ),
          "label",
        ],
        [sequelize.fn("COUNT", sequelize.col("messages.message_id")), "count"],
      ],
      include: [
        {
          model: Message,
          as: "messages",
          attributes: [],
          where: { role: "user" },
          required: true,
        },
      ],
      where: {
        "$messages.created_at$": {
          [Op.gte]: sequelize.literal("NOW() - INTERVAL '14 days'"),
        },
      },
      group: [
        sequelize.fn("TO_CHAR", sequelize.col("messages.created_at"), "DD Mon"),
        sequelize.fn("DATE", sequelize.col("messages.created_at")),
      ],
      order: [
        [sequelize.fn("DATE", sequelize.col("messages.created_at")), "ASC"],
      ],
      raw: true,
    });
  }

  // ── TREN MINGGUAN (Menghitung Volume Chat Per Minggu) ──
  async getWeeklyTrends() {
    return await Conversation.findAll({
      attributes: [
        [
          sequelize.fn(
            "TO_CHAR",
            sequelize.fn(
              "DATE_TRUNC",
              "week",
              sequelize.col("messages.created_at")
            ),
            "DD Mon"
          ),
          "label",
        ],
        [sequelize.fn("COUNT", sequelize.col("messages.message_id")), "count"],
      ],
      include: [
        {
          model: Message,
          as: "messages",
          attributes: [],
          where: { role: "user" },
          required: true,
        },
      ],
      where: {
        "$messages.created_at$": {
          [Op.gte]: sequelize.literal("NOW() - INTERVAL '12 weeks'"),
        },
      },
      group: [
        sequelize.fn(
          "DATE_TRUNC",
          "week",
          sequelize.col("messages.created_at")
        ),
      ],
      order: [
        [
          sequelize.fn(
            "DATE_TRUNC",
            "week",
            sequelize.col("messages.created_at")
          ),
          "ASC",
        ],
      ],
      raw: true,
    });
  }

  // ── USER LEADERBOARD ──
  async getUserLeaderboard(limitCount = null, filters = {}) {
    const { startDate, endDate, userCreatedStartDate, userCreatedEndDate } = filters;

    // 1. Deklarasi objek kriteria filter dasar
    const userWhere = { role: "student" };
    const messageWhere = { role: "user" };

    // 2. Tentukan variabel range tanggal pembuatan akun
    const filterStart = userCreatedStartDate || startDate;
    const filterEnd = userCreatedEndDate || endDate;

    if (filterStart && filterEnd) {
      userWhere.created_at = {
        [Op.between]: [new Date(filterStart), new Date(filterEnd)],
      };
    } else if (filterStart) {
      userWhere.created_at = { [Op.gte]: new Date(filterStart) };
    } else if (filterEnd) {
      userWhere.created_at = { [Op.lte]: new Date(filterEnd) };
    }

    // 3. Konfigurasi Opsi Query Sequelize
    const queryOptions = {
      attributes: [
        "user_id",
        "username",
        "full_name",
        "created_at",
        [
          sequelize.fn(
            "COUNT",
            sequelize.col("conversations.messages.message_id")
          ),
          "count",
        ],
      ],
      where: userWhere,
      include: [
        {
          model: Conversation,
          as: "conversations",
          attributes: [],
          required: true,
          include: [
            {
              model: Message,
              as: "messages",
              attributes: [],
              where: messageWhere,
            },
          ],
        },
      ],
      group: [
        "User.user_id",
        "User.username",
        "User.full_name",
        "User.created_at",
      ],
      order: [[sequelize.literal("count"), "DESC"]],
      subQuery: false,
      raw: true,
    };

    // 4. Pasang limit jika di-passing dari service
    if (limitCount) {
      queryOptions.limit = limitCount;
    }

    return await User.findAll(queryOptions);
  }

  // ── TOTAL USERS ──
  async getTotalUsers() {
    return await User.count({
      where: { role: "student" },
    });
  }
}

export default new DashboardRepository();