import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import User from "../../models/user.model.js";
import { sequelize } from "../../utils/supabaseClient.js";
import { Op } from "sequelize";

class DashboardRepository {
  async getDailyTrends() {
    return await Conversation.findAll({
      attributes: [
        [
          sequelize.fn(
            "TO_CHAR",
            sequelize.col("messages.created_at"),
            "DD Mon",
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
        // Filter 14 hari terakhir berdasarkan waktu chat dikirim
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
              sequelize.col("messages.created_at"),
            ),
            "DD Mon",
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
          sequelize.col("messages.created_at"),
        ),
      ],
      order: [
        [
          sequelize.fn(
            "DATE_TRUNC",
            "week",
            sequelize.col("messages.created_at"),
          ),
          "ASC",
        ],
      ],
      raw: true,
    });
  }

  async getUserLeaderboard(limitCount = 7) {
    return await User.findAll({
      attributes: [
        "user_id",
        "username",
        "full_name",
        [
          sequelize.fn(
            "COUNT",
            sequelize.col("conversations.messages.message_id"),
          ),
          "count",
        ],
      ],
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
              where: { role: "user" },
            },
          ],
        },
      ],
      group: ["User.user_id", "User.username", "User.full_name"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: limitCount,
      subQuery: false,
      raw: true,
    });
  }
}

export default new DashboardRepository();
