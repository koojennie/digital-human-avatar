import Conversation from "../../models/conversation.model.js";
import Message from "../../models/message.model.js";
import Course from "../../models/course.model.js";
import { sequelize } from "../../utils/supabaseClient.js";
import StudentEngagementReport from "../../models/studentEngagementReport.js";
import User from "../../models/user.model.js";

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
     WITH extracted_topics AS (
        SELECT 
          CASE 
            -- Pola 1: Menangkap frasa setelah kata "bedanya x dan y"
            WHEN LOWER(content) ~ 'bedanya\\s+([a-zA-Z0-9\\s,\\-_]+)' 
              THEN SUBSTRING(LOWER(content) FROM 'bedanya\\s+([a-zA-Z0-9\\s,\\-_]+)')
            
            -- Pola 2: Menangkap frasa setelah kata "cara x"
            WHEN LOWER(content) ~ 'cara\\s+([a-zA-Z0-9\\s,\\-_]+)' 
              THEN 'cara ' || SUBSTRING(LOWER(content) FROM 'cara\\s+([a-zA-Z0-9\\s,\\-_]+)')
            
            -- Pola 3: Menangkap frasa sebelum "gimana" atau "di js"
            WHEN LOWER(content) ~ '([a-zA-Z0-9\\s,\\-_]+)\\s+(gimana|bagaimana)' 
              THEN SUBSTRING(LOWER(content) FROM '([a-zA-Z0-9\\s,\\-_]+)\\s+(gimana|bagaimana)')
              
            -- Default: Jika kalimat pendek, ambil maksimal 4 kata pertama
            ELSE TRIM(REGEXP_REPLACE(LOWER(content), '^((?:\\w+\\s+){1,3}\\w+).*$', '\\1'))
          END AS raw_topic
        FROM messages
        WHERE role = 'user' AND content IS NOT NULL
      ),
      filtered_topics AS (
        SELECT 
          -- Bersihkan sisa spasi atau karakter aneh di ujung kalimat
          TRIM(REGEXP_REPLACE(raw_topic, '[^a-zA-Z0-9\\s,]', '', 'g')) AS text
        FROM extracted_topics
      )
      SELECT text, COUNT(*) AS value
      FROM filtered_topics
      WHERE text IS NOT NULL 
        AND LENGTH(text) > 4 
        AND LENGTH(text) < 40
        AND text NOT IN ('yang', 'untuk', 'dengan', 'adalah', 'bisa', 'kamu', 'saya')
      GROUP BY text
      ORDER BY value DESC
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
      include: [
        {
          model: User,
          as: "user",
          attributes: ["created_at"],
        },
      ],
      raw: true,
      nest: true,
    });
  }
}

export default new EngagmentRepository();
