import { Model, DataTypes } from "sequelize";
import { sequelize } from "../utils/supabaseClient.js";
import Conversation from "./conversation.model.js";

class User extends Model {
  static associate(models) {
    User.hasMany(models.Conversation, {
      foreignKey: "user_id",
      as: "conversations",
    });
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.CHAR(8),
      primaryKey: true,
      allowNull: false,
    },
    moodle_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { isEmail: true },
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "student",
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default User;
