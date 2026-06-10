import { Model, DataTypes } from "sequelize";
import { sequelize } from "../utils/supabaseClient.js";
import Conversation from "./conversation.model.js";

class Course extends Model {
  static associate(models) {
    Course.hasMany(models.Conversation, {
      foreignKey: "course_id",
      as: "conversations",
    });
  }
}

Course.init(
  {
    course_id: {
      type: DataTypes.CHAR(8),
      primaryKey: true,
      allowNull: false,
    },
    moodle_course_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    shortname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Course",
    tableName: "courses",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Course;
