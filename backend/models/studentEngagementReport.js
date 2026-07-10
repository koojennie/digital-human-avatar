import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/supabaseClient.js";

class StudentEngagementReport extends Model {}

StudentEngagementReport.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    moodle_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "moodle_user_id",
    },
    nama_mahasiswa: {
      type: DataTypes.STRING(100),
      field: "nama_mahasiswa",
    },
    email: {
      type: DataTypes.STRING(100),
      field: "email",
    },
    total_klik: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "total_klik",
    },
    normalized_klik: {
      type: DataTypes.NUMERIC(8, 6),
      defaultValue: 0.0,
      field: "normalized_klik",
    },
    total_pertanyaan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "total_pertanyaan",
    },
    avg_cosine_similarity: {
      type: DataTypes.NUMERIC(8, 6),
      defaultValue: 0.0,
      field: "avg_cosine_similarity",
    },
    pct_relevan: {
      type: DataTypes.NUMERIC(5, 1),
      defaultValue: 0.0,
      field: "pct_relevan",
    },
    engagement_score: {
      type: DataTypes.NUMERIC(5, 4),
      defaultValue: 0.0,
      field: "engagement_score",
    },
    kategori: {
      type: DataTypes.STRING(20),
      field: "kategori",
    },
    last_updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "last_updated_at",
    },
  },
  {
    sequelize,
    modelName: "StudentEngagementReport",
    tableName: "student_engagement_reports",
    timestamps: false,
  }
);

export default StudentEngagementReport;