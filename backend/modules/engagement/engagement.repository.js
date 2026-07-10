import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import Course from "../../models/course.model.js";
import { sequelize } from "../../utils/supabaseClient.js";
import StudentEngagementReport from "../../models/studentEngagementReport.js";

class EngagmentRepository {
  async getFeatureAdoptionStats() {
    return await Message.findAll({
      attributes: [
        "type",
        [sequelize.fn("COUNT", sequelize.col("message_id")), "total"],
      ],
      where: { role: "user" },
      group: ["type"],
      raw: true,
    });
  }

  async getDiscussionDepthStats() {
    const totalMessages = await Message.count({ where: { role: "user" } });
    const totalSessions = await Conversation.count();

    return {
      totalMessages,
      totalSessions,
      averageMessagesPerSession:
        totalSessions > 0 ? (totalMessages / totalSessions).toFixed(1) : 0,
    };
  }

  async getTopKeywords(limitCount = 10) {
    // Kueri SQL mentah via Sequelize untuk memecah kalimat chat mahasiswa menjadi baris kata kustom
    const query = `
      SELECT word, COUNT(*) as frequency
      FROM (
        SELECT LOWER(REGEXP_SPLIT_TO_TABLE(content, '\s+')) as word
        FROM messages
        WHERE role = 'user'
      ) AS words_table
      WHERE LENGTH(word) > 4 
        AND word NOT IN ('yang', 'untuk', 'dengan', 'adalah', 'bisa', 'kamu', 'saya', 'bukan', 'atau', 'dari', 'ini', 'itu')
      GROUP BY word
      ORDER BY frequency DESC
      LIMIT :limitCount;
    `;

    return await sequelize.query(query, {
      replacements: { limitCount },
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async getTopCoursesByEngagement(limitCount = 5) {
    return await Conversation.findAll({
      attributes: [
        // Ambil nama panjang Course
        [sequelize.col("course.fullname"), "courseName"],

        
        [
          sequelize.fn("COUNT", sequelize.col("messages.message_id")),
          "messageCount",
        ],
      ],
      include: [
        {
          model: Course,
          as: "course",
          attributes: [],
          required: true,
        },
        {
          model: Message,
          as: "messages",
          attributes: [],
          where: {
            role: "user",
          },
          required: true,
        },
      ],
      group: ["course.fullname", "course.course_id"], 
      order: [[sequelize.literal('"messageCount"'), "DESC"]],
      limit: limitCount,
      subQuery: false, 
      raw: true,
    });
  }

  async getEngagementDashboardCosineSimilarity() {
    return await StudentEngagementReport.findAll({
      order: [["engagement_score", "DESC"]],
      raw: true,
    });
  }
}

export default new EngagmentRepository();
