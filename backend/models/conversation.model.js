import { Model, DataTypes } from "sequelize";
import { sequelize } from "../utils/supabaseClient.js";

class Conversation extends Model {
  static associate(models) {
    Conversation.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
    });
    
    Conversation.belongsTo(models.Course, {
      foreignKey: "course_id",
      as: "course",
    });

    Conversation.hasMany(models.Message, {
      foreignKey: "conversation_id",
      as: "messages",
    });

  }
}

Conversation.init(
  {
    conversation_id: {
      type: DataTypes.CHAR(8),
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.CHAR(8),
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    course_id: {
      type: DataTypes.CHAR(8),
      allowNull: true,
      references: { model: "courses", key: "course_id" },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "Conversation",
    tableName: "conversations",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);
export default Conversation;
